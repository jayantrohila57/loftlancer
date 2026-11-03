#!/usr/bin/env node
/**
 * Mechanical architecture gate for module/ + oRPC (docs/gaps/*).
 * features/ is not scanned yet — see features/README.md and docs/tooling.md.
 * Fails on NEW violations vs baseline; use --strict to fail on all.
 *
 * Usage:
 *   node scripts/audit-module-architecture.mjs
 *   node scripts/audit-module-architecture.mjs --write-baseline
 *   node scripts/audit-module-architecture.mjs --strict
 */
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const BASELINE_PATH = join(
  ROOT,
  "scripts/audit-module-architecture-baseline.json",
);

const LEGACY_UNWRAP_ALLOW = [
  "packages/orpc/src/routers/",
  "packages/orpc/src/mcp/",
  "module/teams/server/handlers/server.legacy-response.handler.ts",
];

const APP_PAGE_FORBIDDEN_IMPORTS = [
  "@loftlancer/drizzle",
  "requireAction",
  'from "drizzle-orm"',
  "from 'drizzle-orm'",
];

const args = new Set(process.argv.slice(2));
const writeBaseline = args.has("--write-baseline");
const strict = args.has("--strict");

/** @type {{ id: string, rule: string, file: string, detail: string }[]} */
const violations = [];

function id(rule, file, detail) {
  const hash = createHash("sha256")
    .update(`${rule}\0${file}\0${detail}`)
    .digest("hex")
    .slice(0, 12);
  return `${rule}:${relative(ROOT, file)}:${hash}`;
}

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".next" || name === "dist")
      continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

function readText(path) {
  return readFileSync(path, "utf8");
}

function checkControllers() {
  const moduleRoot = join(ROOT, "module");
  if (!statSync(moduleRoot, { throwIfNoEntry: false })?.isDirectory()) return;
  for (const domain of readdirSync(moduleRoot)) {
    const ctrlDir = join(moduleRoot, domain, "server", "controller");
    if (!statSync(ctrlDir, { throwIfNoEntry: false })?.isDirectory()) continue;
    for (const file of readdirSync(ctrlDir)) {
      if (!file.endsWith(".controller.ts")) continue;
      const path = join(ctrlDir, file);
      const text = readText(path);
      const hasParse =
        /serviceResponseSchema\s*\([^)]*\)\s*\.parse\s*\(/.test(text) ||
        (/return\s+serviceResponseSchema/.test(text) &&
          /\.parse\s*\(\s*response\s*\)/.test(text));
      if (!hasParse) {
        violations.push({
          id: id("controller-response-schema", path, "missing outbound parse"),
          rule: "controller-response-schema",
          file: relative(ROOT, path),
          detail:
            "Controller must return serviceResponseSchema(...).parse(response) (docs/gaps/contracts.md).",
        });
      }
    }
  }
}

function checkOrpcProcedures() {
  const dir = join(ROOT, "packages/orpc/src/orpc/procedures");
  if (!statSync(dir, { throwIfNoEntry: false })?.isDirectory()) return;
  for (const file of readdirSync(dir)) {
    if (!file.endsWith(".ts")) continue;
    const path = join(dir, file);
    const text = readText(path);
    if (/\.input\s*\(\s*z\.unknown\s*\(\s*\)\s*\)/.test(text)) {
      violations.push({
        id: id("orpc-input-schema", path, "z.unknown input"),
        rule: "orpc-input-schema",
        file: relative(ROOT, path),
        detail:
          "oRPC .input() must use module utils/validation schema, not z.unknown() (docs/gaps/orpc-transport.md).",
      });
    }
    if (/teamControllerInputSchema/.test(text)) {
      violations.push({
        id: id("orpc-input-schema", path, "teamControllerInputSchema"),
        rule: "orpc-input-schema",
        file: relative(ROOT, path),
        detail:
          "teamControllerInputSchema is z.unknown(); use per-operation Zod schemas in procedures.",
      });
    }
    if (!/from\s+["']@modules?\//.test(text)) {
      violations.push({
        id: id("orpc-module-import", path, "no @module import"),
        rule: "orpc-module-import",
        file: relative(ROOT, path),
        detail:
          "oRPC procedures must import controllers/schemas from @modules/* (or dual @module/*).",
      });
    }
  }
}

function checkLegacyUnwrap() {
  const roots = ["packages/orpc/src", "apps", "module"];
  for (const rootRel of roots) {
    const dir = join(ROOT, rootRel);
    if (!statSync(dir, { throwIfNoEntry: false })?.isDirectory()) continue;
    for (const path of walk(dir)) {
      if (!/\.(ts|tsx|mts|mjs)$/.test(path)) continue;
      const rel = relative(ROOT, path);
      if (LEGACY_UNWRAP_ALLOW.some((p) => rel.startsWith(p))) continue;
      const text = readText(path);
      if (/unwrapTeam(Object|List)\s*\(/.test(text)) {
        violations.push({
          id: id("legacy-unwrap", path, "unwrapTeam*"),
          rule: "legacy-unwrap",
          file: rel,
          detail:
            "unwrapTeam* only allowed in tRPC/MCP adapters (docs/gaps/contracts.md).",
        });
      }
    }
  }
}

function checkAppPages() {
  for (const app of ["studio", "auth", "docs", "www"]) {
    const appDir = join(ROOT, "apps", app, "src", "app");
    if (!statSync(appDir, { throwIfNoEntry: false })?.isDirectory()) continue;
    for (const path of walk(appDir)) {
      if (!path.endsWith("page.tsx")) continue;
      const text = readText(path);
      const lines = text.split("\n").length;
      for (const imp of APP_PAGE_FORBIDDEN_IMPORTS) {
        if (text.includes(imp)) {
          violations.push({
            id: id("app-page-forbidden", path, imp),
            rule: "app-page-forbidden",
            file: relative(ROOT, path),
            detail: `App page must not import ${imp} (docs/gaps/forbidden-defaults.md).`,
          });
        }
      }
      const hasModuleImport = /from\s+["']@modules?\//.test(text);
      const isReExportHeavy =
        lines <= 25 &&
        (/export\s+\{[^}]+\}\s+from\s+["']@modules?\//.test(text) ||
          /export\s+\*\s+from\s+["']@modules?\//.test(text));
      if (
        app === "studio" &&
        text.includes("(shell)") === false &&
        path.includes("/teams/") &&
        !hasModuleImport &&
        lines > 15
      ) {
        violations.push({
          id: id("app-page-thin", path, "teams not @module"),
          rule: "app-page-thin",
          file: relative(ROOT, path),
          detail:
            "Studio teams routes should re-export from @modules/* or dual @module/* (~15 lines, docs/gaps/forbidden-defaults.md).",
        });
      }
      if (
        app === "studio" &&
        path.includes("/teams/") &&
        hasModuleImport &&
        !isReExportHeavy &&
        lines > 30
      ) {
        violations.push({
          id: id("app-page-thin", path, "too many lines"),
          rule: "app-page-thin",
          file: relative(ROOT, path),
          detail: `App page has ${lines} lines; keep domain logic in module/ (forbidden-defaults).`,
        });
      }
    }
  }
}

function checkPilotReadmeClaims() {
  const readme = join(ROOT, "module/teams/README.md");
  if (!statSync(readme, { throwIfNoEntry: false })?.isFile()) return;
  const text = readText(readme);
  if (/## Pilot checklist[\s\S]*?\[x\].*all green/i.test(text)) {
    /* informational only — not a baseline rule yet */
  }
  if (
    text.includes("teamControllerInputSchema") &&
    text.includes("untrusted through the transport")
  ) {
    /* documented exception — orpc rule still flags procedure file */
  }
}

checkControllers();
checkOrpcProcedures();
checkLegacyUnwrap();
checkAppPages();
checkPilotReadmeClaims();

violations.sort((a, b) => a.id.localeCompare(b.id));

function loadBaseline() {
  try {
    return JSON.parse(readFileSync(BASELINE_PATH, "utf8"));
  } catch {
    return { version: 1, ids: [] };
  }
}

if (writeBaseline) {
  writeFileSync(
    BASELINE_PATH,
    `${JSON.stringify(
      {
        version: 1,
        description:
          "Known architecture violations; CI fails only on NEW ids. Shrink by fixing code, then --write-baseline.",
        ids: violations.map((v) => v.id),
      },
      null,
      2,
    )}\n`,
  );
  console.log(
    `Wrote baseline with ${violations.length} violation(s) to ${relative(ROOT, BASELINE_PATH)}`,
  );
  process.exit(0);
}

const baseline = loadBaseline();
const baselineSet = new Set(baseline.ids ?? []);
const novel = strict
  ? violations
  : violations.filter((v) => !baselineSet.has(v.id));
const resolved = [...baselineSet].filter(
  (bid) => !violations.some((v) => v.id === bid),
);

if (resolved.length) {
  console.log(
    `Resolved ${resolved.length} baseline violation(s) — run with --write-baseline to shrink debt.`,
  );
}

if (novel.length === 0) {
  console.log(
    `module architecture audit: ok (${violations.length} known, 0 new${strict ? ", strict" : ""})`,
  );
  process.exit(0);
}

console.error(
  `module architecture audit: ${novel.length} ${strict ? "violation(s)" : "NEW violation(s)"}:\n`,
);
for (const v of novel) {
  console.error(`  [${v.rule}] ${v.file}\n    ${v.detail}\n    id: ${v.id}`);
}
if (!strict && violations.length > novel.length) {
  console.error(
    `\n(${violations.length - novel.length} additional known violation(s) in baseline.)`,
  );
}
console.error(
  "\nFix or allowlist: docs/tooling.md · scripts/audit-module-architecture.mjs",
);
process.exit(1);
