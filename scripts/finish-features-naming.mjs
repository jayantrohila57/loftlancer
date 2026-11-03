#!/usr/bin/env node
/**
 * Finish features naming migration: bulk import rewrites (no deprecated shims).
 */
import {
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

const REPLACEMENTS = [
  // authorization
  [
    "@features/authorization/shared/actions/nav",
    "@features/authorization/config/authorization.nav",
  ],
  [
    "@features/authorization/shared/actions/platform-admin-flag",
    "@features/authorization/utils/authorization.platform-admin-flag",
  ],
  [
    "@features/authorization/shared/actions/apps",
    "@features/authorization/config/authorization.apps",
  ],
  ["@features/authorization/shared", "@features/authorization/utils"],
  [
    "@features/authorization/server/page-guards/require-page-action",
    "@features/authorization/core/server/page-guards/authorization.require-page-action",
  ],
  [
    "@features/authorization/server/is-action-blocked",
    "@features/authorization/core/server/authorization.is-action-blocked",
  ],
  [
    "@features/authorization/server/audit-event-writer-host",
    "@features/authorization/core/server/authorization.audit-event-writer-host",
  ],
  [
    "@features/authorization/server/require-action-host",
    "@features/authorization/core/server/authorization.require-action-host",
  ],
  [
    "@features/authorization/server/audit-event-writer",
    "@features/authorization/core/server/authorization.audit-event-writer",
  ],
  [
    "@features/authorization/server/platform-admin-context",
    "@features/authorization/core/server/authorization.platform-admin-context",
  ],
  [
    "@features/authorization/server/require-action",
    "@features/authorization/core/server/authorization.require-action",
  ],
  [
    "@features/authorization/server/run-action",
    "@features/authorization/core/server/authorization.run-action",
  ],
  // authentication
  [
    "@features/authentication/server/register-better-auth-product-hooks",
    "@features/authentication/core/server/authentication.register-better-auth-product-hooks",
  ],
  [
    "@features/authentication/server/page-guards",
    "@features/authentication/core/server/authentication.page-guards-next",
  ],
  ["@features/authentication/shared", "@features/authentication/utils"],
  ["@features/authentication/client", "@features/authentication/core/client"],
  // shell
  ["@features/shell/shared/", "@features/shell/utils/"],
  ["@features/shell/client/", "@features/shell/core/client/"],
  // marketing
  [
    "@features/marketing/client/features",
    "@features/marketing/constants/marketing.features",
  ],
  ["@features/marketing/client/", "@features/marketing/core/client/"],
  // analytics / observability
  ["@features/analytics/client", "@features/analytics/core/client"],
  ["@features/observability/client", "@features/observability/core/client"],
  // data-table
  [
    "@features/data-table/shared/data-table.empty-types",
    "@features/data-table/types/data-table.empty.types",
  ],
  ["@features/data-table/shared/", "@features/data-table/types/"],
  [
    "@features/data-table/client/data-table.table",
    "@features/data-table/core/client/data-table.table",
  ],
  ["@features/data-table/client/", "@features/data-table/core/client/"],
  // patterns
  ["@features/patterns/shared/", "@features/patterns/utils/"],
  ["@features/patterns/client/", "@features/patterns/core/client/"],
  // api
  ["@features/api/shared", "@features/api/utils"],
  [
    "@features/api/server/errors/friendly-error",
    "@features/api/utils/api.friendly-error.utils",
  ],
  ["@features/api/server/", "@features/api/core/server/"],
  // notifications legacy barrels (remove shims — point to final paths)
  ["@features/notifications/shared", "@features/notifications/utils"],
  ["@features/notifications/server/", "@features/notifications/core/server/"],
];

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  ".pnpm-store",
  ".turbo",
]);

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, files);
    else if (
      /\.(ts|tsx|md|mdx|mjs|json)$/.test(name) &&
      !p.includes("finish-features-naming.mjs")
    )
      files.push(p);
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

const files = walk(ROOT);
let changed = 0;
for (const file of files) {
  const before = readFileSync(file, "utf8");
  const after = applyReplacements(before);
  if (after !== before) {
    writeFileSync(file, after);
    changed++;
  }
}

console.log(`Updated ${changed} files with import path rewrites.`);

const REMOVE_PATHS = [
  "features/authorization/src/server",
  "features/authorization/src/shared",
  "features/authorization/src/client",
  "features/notifications/src/server",
  "features/notifications/src/shared",
  "features/authentication/src/server",
  "features/authentication/src/client",
  "features/authentication/src/shared",
];

for (const rel of REMOVE_PATHS) {
  const p = join(ROOT, rel);
  try {
    rmSync(p, { recursive: true, force: true });
    console.log("Removed", rel);
  } catch {
    /* ignore */
  }
}
