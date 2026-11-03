#!/usr/bin/env node
/**
 * Apply features layout/naming audit fixes (see features/NAMING.md).
 */
import {
  copyFileSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

const REPLACEMENTS = [
  [
    "@features/authentication/core/client",
    "@features/authentication/core/client",
  ],
  [
    "@features/data-table/types/data-table.empty.types",
    "@features/data-table/types/data-table.empty.types",
  ],
  ["@features/data-table/types/", "@features/data-table/types/"],
  [
    "@features/patterns/utils/format-date",
    "@features/patterns/utils/patterns.format-date.utils",
  ],
  [
    "@features/patterns/utils/local-day",
    "@features/patterns/utils/patterns.local-day.utils",
  ],
  [
    "@features/patterns/utils/page-header-classes",
    "@features/patterns/utils/patterns.page-header-classes.utils",
  ],
  [
    "@features/patterns/utils/page-header-grid-classes",
    "@features/patterns/utils/patterns.page-header-grid-classes.utils",
  ],
  [
    "@features/patterns/utils/page-header-description-measure",
    "@features/patterns/utils/patterns.page-header-description-measure.utils",
  ],
  [
    "@features/patterns/utils/segmented-control",
    "@features/patterns/utils/patterns.segmented-control.utils",
  ],
  [
    "@features/patterns/utils/settings-tabs",
    "@features/patterns/config/patterns.settings-tabs.config",
  ],
  [
    "@features/patterns/utils/fonts",
    "@features/patterns/utils/patterns.fonts.utils",
  ],
  [
    "@features/shell/utils/shell.layout-spacing",
    "@features/shell/utils/shell.layout-spacing.utils",
  ],
  [
    "@features/shell/utils/shell.platform-status",
    "@features/shell/utils/shell.platform-status.utils",
  ],
  [
    "@features/shell/utils/shell.platform-urls",
    "@features/shell/utils/shell.platform-urls.utils",
  ],
  [
    "@features/shell/utils/shell.studio-routes",
    "@features/shell/utils/shell.studio-routes.utils",
  ],
  [
    "features/authorization/src/shared/registry-data.ts",
    "features/authorization/src/constants/authorization.registry-data.ts",
  ],
  [
    "../src/utils/patterns.format-date",
    "../src/utils/patterns.format-date.utils",
  ],
  ["../src/utils/patterns.local-day", "../src/utils/patterns.local-day.utils"],
  [
    "../src/utils/patterns.page-header-classes",
    "../src/utils/patterns.page-header-classes.utils",
  ],
  [
    "../src/utils/patterns.page-header-grid-classes",
    "../src/utils/patterns.page-header-grid-classes.utils",
  ],
  [
    "../src/utils/patterns.page-header-description-measure",
    "../src/utils/patterns.page-header-description-measure.utils",
  ],
  [
    "../src/utils/shell.studio-routes",
    "../src/utils/shell.studio-routes.utils",
  ],
  [
    "../src/utils/shell.platform-urls",
    "../src/utils/shell.platform-urls.utils",
  ],
  [
    'from "../../shared/data-table.empty-types"',
    'from "../../types/data-table.empty.types"',
  ],
  [
    'from "./data-table.empty-types"',
    'from "../../types/data-table.empty.types"',
  ],
  ['from "../utils/patterns.fonts"', 'from "../utils/patterns.fonts.utils"'],
  [
    'from "../utils/patterns.settings-tabs"',
    'from "./patterns.settings-tabs.config"',
  ],
];

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  ".turbo",
  ".pnpm-store",
]);

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, files);
    else if (/\.(ts|tsx|md|mdx|mjs|json)$/.test(name)) files.push(p);
  }
  return files;
}

function applyReplacements(content) {
  let out = content;
  for (const [from, to] of REPLACEMENTS) {
    out = out.split(from).join(to);
  }
  return out;
}

function safeRename(from, to) {
  try {
    statSync(from);
  } catch {
    return;
  }
  try {
    statSync(to);
    rmSync(to);
  } catch {
    /* ok */
  }
  renameSync(from, to);
}

// --- Renames: patterns utils (drop duplicate *.utils.ts shims first) ---
const patternsUtils = join(ROOT, "features/patterns/src/utils");
for (const base of [
  "patterns.format-date",
  "patterns.local-day",
  "patterns.page-header-classes",
  "patterns.page-header-grid-classes",
  "patterns.page-header-description-measure",
]) {
  const shim = join(patternsUtils, `${base}.utils.ts`);
  try {
    rmSync(shim);
  } catch {
    /* ok */
  }
  safeRename(
    join(patternsUtils, `${base}.ts`),
    join(patternsUtils, `${base}.utils.ts`),
  );
}
safeRename(
  join(patternsUtils, "patterns.fonts.ts"),
  join(patternsUtils, "patterns.fonts.utils.ts"),
);
safeRename(
  join(patternsUtils, "patterns.segmented-control.ts"),
  join(patternsUtils, "patterns.segmented-control.utils.ts"),
);

// Inline settings-tabs into config
const settingsTabsUtils = join(patternsUtils, "patterns.settings-tabs.ts");
const settingsTabsConfig = join(
  ROOT,
  "features/patterns/src/config/patterns.settings-tabs.config.ts",
);
try {
  const body = readFileSync(settingsTabsUtils, "utf8");
  writeFileSync(settingsTabsConfig, body);
  rmSync(settingsTabsUtils);
} catch {
  /* ok */
}

// patterns hooks: keep implementations in core/client/*.hook.ts
const hookNames = [
  "patterns.use-hydrated.hook.ts",
  "patterns.use-media-query.hook.ts",
  "patterns.use-online-status.hook.ts",
  "patterns.use-unsaved-changes-guard.hook.ts",
];
const hooksDir = join(ROOT, "features/patterns/src/core/client/hooks");
for (const file of hookNames) {
  const src = join(hooksDir, file);
  const dest = join(ROOT, "features/patterns/src/core/client", file);
  try {
    copyFileSync(src, dest);
  } catch {
    /* ok */
  }
}
try {
  rmSync(hooksDir, { recursive: true, force: true });
} catch {
  /* ok */
}

// shell utils renames
const shellUtils = join(ROOT, "features/shell/src/utils");
for (const base of [
  "shell.layout-spacing",
  "shell.platform-status",
  "shell.platform-urls",
  "shell.studio-routes",
]) {
  safeRename(
    join(shellUtils, `${base}.ts`),
    join(shellUtils, `${base}.utils.ts`),
  );
}

// data-table types move
const dtTypes = join(ROOT, "features/data-table/src/types");
mkdirSync(dtTypes, { recursive: true });
safeRename(
  join(ROOT, "features/data-table/src/shared/data-table.empty-types.ts"),
  join(dtTypes, "data-table.empty.types.ts"),
);
try {
  rmSync(join(ROOT, "features/data-table/src/shared"), {
    recursive: true,
    force: true,
  });
} catch {
  /* ok */
}

// authorization orphan shims
for (const f of ["registry.ts", "types.ts"]) {
  try {
    rmSync(join(ROOT, "features/authorization/src/utils", f));
  } catch {
    /* ok */
  }
}

// Remove legacy compat trees
for (const rel of [
  "features/authorization/src/server",
  "features/authorization/src/client",
  "features/authentication/src/server",
  "features/authentication/src/client",
  "features/authentication/src/shared",
  "features/api/src/client",
  "features/api/src/server",
  "features/notifications/src/server",
  "features/notifications/src/shared",
]) {
  try {
    rmSync(join(ROOT, rel), { recursive: true, force: true });
    console.log("Removed", rel);
  } catch {
    /* ok */
  }
}

// Add package root barrels where missing
const indexBarrels = {
  "features/analytics/src/index.ts": 'export * from "./core/client/index";\n',
  "features/api/src/index.ts":
    'export * from "./core/server/index";\nexport * from "./utils/index";\n',
  "features/data-table/src/index.ts": 'export * from "./core/client/index";\n',
  "features/observability/src/index.ts":
    'export * from "./core/client/index";\n',
  "features/patterns/src/index.ts": 'export * from "./core/client/index";\n',
  "features/shell/src/index.ts":
    'export * from "./core/client/index";\nexport * from "./utils/index";\n',
};
for (const [rel, content] of Object.entries(indexBarrels)) {
  const p = join(ROOT, rel);
  try {
    statSync(p);
  } catch {
    writeFileSync(p, content);
    console.log("Wrote", rel);
  }
}

// tests/ placeholders
for (const feat of ["api", "data-table", "observability", "marketing"]) {
  const dir = join(ROOT, "features", feat, "tests");
  mkdirSync(dir, { recursive: true });
  const keep = join(dir, ".gitkeep");
  try {
    statSync(keep);
  } catch {
    writeFileSync(keep, "");
  }
}

// Bulk import rewrites
const files = walk(ROOT).filter(
  (f) => !f.includes("apply-features-layout-audit.mjs"),
);
let changed = 0;
for (const file of files) {
  const before = readFileSync(file, "utf8");
  const after = applyReplacements(before);
  if (after !== before) {
    writeFileSync(file, after);
    changed++;
  }
}

console.log(`Updated ${changed} files with import/path rewrites.`);
