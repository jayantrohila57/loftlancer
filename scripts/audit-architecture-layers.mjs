#!/usr/bin/env node
/**
 * Layer dependency gate: Apps → Modules → Features → Packages.
 * - features/** must not import module/**
 * - packages/** must not import module/** or features/** except PACKAGES_IMPORT_ALLOW_PREFIX
 *
 * Usage:
 *   node scripts/audit-architecture-layers.mjs
 *   node scripts/audit-architecture-layers.mjs --write-baseline
 *   node scripts/audit-architecture-layers.mjs --strict
 *
 * Allowlist documented in docs/features.md.
 */
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const BASELINE_PATH = join(
  ROOT,
  "scripts/audit-architecture-layers-baseline.json",
);

/** @see docs/features.md — packages/api transport only */
const PACKAGES_IMPORT_ALLOW_PREFIX = [
  "packages/api/src/orpc/",
  "packages/api/src/mcp/",
  "packages/api/src/routers/",
];

const IMPORT_PATTERNS = [
  { label: "@module/", re: /from\s+["']@module\// },
  { label: "@features/", re: /from\s+["']@features\// },
  {
    label: "module/ path",
    re: /from\s+["'](?:\.\.\/)*module\//,
  },
  {
    label: "features/ path",
    re: /from\s+["'](?:\.\.\/)*features\//,
  },
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

function findForbiddenImports(text) {
  /** @type {string[]} */
  const hits = [];
  for (const { label, re } of IMPORT_PATTERNS) {
    if (re.test(text)) hits.push(label);
  }
  return hits;
}

function isAllowedPackageFile(rel) {
  return PACKAGES_IMPORT_ALLOW_PREFIX.some((p) => rel.startsWith(p));
}

function checkFeaturesLayer() {
  const featuresRoot = join(ROOT, "features");
  if (!statSync(featuresRoot, { throwIfNoEntry: false })?.isDirectory()) return;
  for (const path of walk(featuresRoot)) {
    if (!/\.(ts|tsx|mts|js|mjs)$/.test(path)) continue;
    const text = readText(path);
    const hits = findForbiddenImports(text).filter(
      (h) => h.includes("module") || h === "@module/",
    );
    if (hits.length === 0) continue;
    violations.push({
      id: id("features-no-module", path, hits.join(", ")),
      rule: "features-no-module",
      file: relative(ROOT, path),
      detail:
        "features/* must not import module/* or @module/* (docs/features.md).",
    });
  }
}

function checkPackagesLayer() {
  const packagesRoot = join(ROOT, "packages");
  if (!statSync(packagesRoot, { throwIfNoEntry: false })?.isDirectory()) return;
  for (const path of walk(packagesRoot)) {
    if (!/\.(ts|tsx|mts|js|mjs)$/.test(path)) continue;
    const rel = relative(ROOT, path);
    const text = readText(path);
    const hits = findForbiddenImports(text);
    if (hits.length === 0) continue;
    if (isAllowedPackageFile(rel)) continue;
    violations.push({
      id: id("packages-layer-import", path, hits.join(", ")),
      rule: "packages-layer-import",
      file: rel,
      detail: `packages/* must not import module/ or features/* outside allowlist (${PACKAGES_IMPORT_ALLOW_PREFIX.join(", ")}).`,
    });
  }
}

checkFeaturesLayer();
checkPackagesLayer();

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
          "Known layer dependency violations; CI fails only on NEW ids. Shrink by fixing code, then --write-baseline.",
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
    `architecture layers audit: ok (${violations.length} known, 0 new${strict ? ", strict" : ""})`,
  );
  process.exit(0);
}

console.error(
  `architecture layers audit: ${novel.length} ${strict ? "violation(s)" : "NEW violation(s)"}:\n`,
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
  "\nFix or allowlist: docs/features.md · scripts/audit-architecture-layers.mjs",
);
process.exit(1);
