#!/usr/bin/env node
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

function ensureDir(p) {
  mkdirSync(p, { recursive: true });
}

function kebabToPurpose(name) {
  return name.replace(/\.tsx?$/, "").replace(/^\./, "");
}

/** data-table: move client/* → core/client/, shared → types */
function migrateDataTable() {
  const base = join(ROOT, "features/data-table/src");
  ensureDir(join(base, "core/client"));
  ensureDir(join(base, "types"));
  for (const f of readdirSync(join(base, "client"))) {
    if (f.endsWith(".tsx") && f.startsWith("data-table.")) {
      renameSync(join(base, "client", f), join(base, "core/client", f));
    }
  }
  const sharedEmpty = join(base, "shared/data-table.empty-types.ts");
  try {
    renameSync(sharedEmpty, join(base, "types/data-table.empty.types.ts"));
  } catch {
    /* ok */
  }
  rmSync(join(base, "client"), { recursive: true, force: true });
  rmSync(join(base, "shared"), { recursive: true, force: true });

  writeFileSync(
    join(base, "core/client/index.ts"),
    `export type { DataTableColumnDef, DataTableProps } from "./data-table.table";
export { DataTable } from "./data-table.table";
export { DataTableToolbar } from "./data-table.toolbar";
export { DataTablePagination } from "./data-table.pagination";
export { DataTableColumnHeader } from "./data-table.column-header";
export { DataTableRowActions } from "./data-table.row-actions";
export { DataTableActionsColumnHeader } from "./data-table.actions-column";
export { DataTableEmpty } from "./data-table.empty";
export { resolveDataTableEmpty } from "./data-table.resolve-empty";
export { DataTableSkeletonBody } from "./data-table.skeleton-body";
`,
  );
}

/** shell: client → core/client, shared → utils + tests */
function migrateShell() {
  const base = join(ROOT, "features/shell/src");
  ensureDir(join(base, "core/client"));
  ensureDir(join(base, "utils"));
  ensureDir(join(base, "tests"));
  for (const f of readdirSync(join(base, "client"))) {
    renameSync(join(base, "client", f), join(base, "core/client", f));
  }
  rmSync(join(base, "client"), { recursive: true, force: true });
  for (const f of readdirSync(join(base, "shared"))) {
    const src = join(base, "shared", f);
    if (f.endsWith(".test.ts")) {
      renameSync(src, join(base, "tests", f));
    } else if (f === "index.ts") {
      /* skip */
    } else {
      renameSync(src, join(base, "utils", f));
    }
  }
  rmSync(join(base, "shared"), { recursive: true, force: true });
  writeFileSync(
    join(base, "utils/index.ts"),
    `export * from "./shell.layout-spacing";
export * from "./shell.platform-status";
export * from "./shell.platform-urls";
export * from "./shell.studio-routes";
`,
  );
  writeFileSync(
    join(base, "core/client/index.ts"),
    readFileSync(join(base, "core/client/index.ts"), "utf8").replace(
      "./shell.",
      "./shell.",
    ),
  );
}

/** patterns: client + shared → core/client, utils, tests, config */
function migratePatterns() {
  const base = join(ROOT, "features/patterns/src");
  ensureDir(join(base, "core/client"));
  ensureDir(join(base, "utils"));
  ensureDir(join(base, "config"));
  ensureDir(join(base, "tests"));

  const clientDir = join(base, "client");
  if (!statSync(clientDir).isDirectory()) return;

  function moveClientFile(name, destName) {
    renameSync(join(clientDir, name), join(base, "core/client", destName));
  }

  for (const f of readdirSync(clientDir)) {
    if (f === "hooks") continue;
    if (f.endsWith(".test.ts")) {
      const purpose = kebabToPurpose(f.replace(".test", ""));
      renameSync(
        join(clientDir, f),
        join(base, "tests", `patterns.${purpose}.test.ts`),
      );
      continue;
    }
    if (!f.endsWith(".tsx")) continue;
    const stem = f.replace(/\.tsx$/, "");
    moveClientFile(f, `patterns.${stem}.tsx`);
  }

  const hooksDir = join(clientDir, "hooks");
  if (statSync(hooksDir).isDirectory()) {
    for (const f of readdirSync(hooksDir)) {
      const hook = f.replace(/^use-/, "").replace(/\.ts$/, "");
      renameSync(
        join(hooksDir, f),
        join(base, "core/client", `patterns.use-${hook}.hook.ts`),
      );
    }
    rmSync(hooksDir, { recursive: true, force: true });
  }
  rmSync(clientDir, { recursive: true, force: true });

  const sharedDir = join(base, "shared");
  if (statSync(sharedDir).isDirectory()) {
    for (const f of readdirSync(sharedDir)) {
      const src = join(sharedDir, f);
      if (f.endsWith(".test.ts")) {
        const stem = f.replace(".test.ts", "");
        renameSync(src, join(base, "tests", `patterns.${stem}.test.ts`));
        continue;
      }
      if (f === "fonts.ts") {
        renameSync(src, join(base, "config", "patterns.fonts.config.ts"));
        continue;
      }
      if (f === "segmented-control.ts") {
        renameSync(
          src,
          join(base, "config", "patterns.segmented-control.config.ts"),
        );
        continue;
      }
      if (f === "settings-tabs.ts") {
        renameSync(
          src,
          join(base, "config", "patterns.settings-tabs.config.ts"),
        );
        continue;
      }
      const stem = f.replace(/\.ts$/, "");
      renameSync(src, join(base, "utils", `patterns.${stem}.utils.ts`));
    }
    rmSync(sharedDir, { recursive: true, force: true });
  }

  writeFileSync(
    join(base, "core/client/index.ts"),
    `export * from "./patterns.page-header";
export * from "./patterns.page-header-description";
export * from "./patterns.page-state";
export * from "./patterns.empty-state";
export * from "./patterns.confirm-dialog";
export * from "./patterns.loading-button";
export * from "./patterns.submit-button";
export * from "./patterns.settings-frame";
export * from "./patterns.settings-row";
export * from "./patterns.accordion-section";
export * from "./patterns.accordion-section-skeleton";
export * from "./patterns.activity-timeline";
export * from "./patterns.activity-overview";
export * from "./patterns.breadcrumb-trail";
export * from "./patterns.guarded-dialog";
export * from "./patterns.discard-changes-dialog";
export * from "./patterns.unsaved-changes-page-guard";
export * from "./patterns.form-sheet-guard-context";
export * from "./patterns.offline-banner";
export * from "./patterns.local-date-time";
export * from "./patterns.mode-toggle";
export * from "./patterns.skip-link";
export * from "./patterns.version-badge";
export * from "./patterns.count-badge";
export * from "./patterns.horizontal-scroll-rail";
export * from "./patterns.searchable-combobox";
export * from "./patterns.sidebar-kit";
export * from "./patterns.settings-panel-skeleton";
export * from "./patterns.required-fields-hint";
export * from "./patterns.delayed-page-loading";
export * from "./patterns.app-route-states";
export * from "./patterns.ai-stream-state";
export * from "./patterns.use-hydrated.hook";
export * from "./patterns.use-media-query.hook";
export * from "./patterns.use-online-status.hook";
export * from "./patterns.use-unsaved-changes-guard.hook";
`,
  );
}

function migrateApi() {
  const base = join(ROOT, "features/api/src");
  ensureDir(join(base, "utils"));
  rmSync(join(base, "server"), { recursive: true, force: true });
  rmSync(join(base, "shared"), { recursive: true, force: true });
  writeFileSync(
    join(base, "utils/index.ts"),
    `export { getFriendlyErrorMessage, throwFriendlyError } from "../core/server/api.friendly-error";
`,
  );
  writeFileSync(
    join(base, "core/server/index.ts"),
    `export * from "./api.friendly-error";
export * from "./api.middleware";
export * from "./api.procedures";
`,
  );
}

function migrateAuthorizationBarrels() {
  const base = join(ROOT, "features/authorization/src");
  writeFileSync(
    join(base, "utils/index.ts"),
    readFileSync(join(base, "shared/index.ts"), "utf8"),
  );
  writeFileSync(
    join(base, "core/server/index.ts"),
    `export {
  checkPermission,
  type PermissionCheckInput,
  type PermissionCheckResult,
} from "./authorization.check-permission";
export {
  buildAccessContext,
  runAction,
  type RunActionContext,
  type RunActionInput,
} from "./authorization.run-action";
export * from "./authorization.require-action";
export * from "./authorization.audit-event-writer";
export * from "./authorization.audit-event-writer-host";
export * from "./authorization.require-action-host";
export * from "./authorization.is-action-blocked";
export * from "./authorization.platform-admin-context";
export { requirePageAction } from "./page-guards/authorization.require-page-action";
`,
  );
  writeFileSync(
    join(base, "index.ts"),
    `export * from "./utils/index";
`,
  );
}

function migrateAuthentication() {
  const base = join(ROOT, "features/authentication/src");
  writeFileSync(
    join(base, "utils/index.ts"),
    `export * from "./authentication.auth-links";
export * from "../types/authentication.platform-sign-out.types";
`,
  );
  writeFileSync(
    join(base, "core/server/index.ts"),
    `export * from "./authentication.auth-audit-event";
export * from "./authentication.organization-invitation-email";
export * from "./authentication.organization-member-access-cleanup";
export * from "./authentication.register-better-auth-product-hooks";
export * from "./authentication.page-guards-next";
export * from "./authentication.page-guard-errors";
`,
  );
  writeFileSync(
    join(base, "core/client/index.ts"),
    `export * from "./authentication.auth-key";
export * from "./authentication.impersonation-banner";
export * from "./authentication.impersonation-banner-ui";
export * from "./authentication.sign-in-options";
`,
  );
}

function fixNotificationsIndex() {
  const p = join(ROOT, "features/notifications/src/index.ts");
  let s = readFileSync(p, "utf8");
  s = s
    .replace(/from "\.\/notifications\./g, 'from "./types/notifications.')
    .replace(
      'from "../utils/notifications.registry.utils"',
      'from "./utils/notifications.registry.utils"',
    )
    .replace(
      'from "../utils/notifications.preferences.utils"',
      'from "./utils/notifications.preferences.utils"',
    )
    .replace(
      'from "../utils/notifications.presentation.utils"',
      'from "./utils/notifications.presentation.utils"',
    )
    .replace('from "../core/server"', 'from "./core/server"');
  writeFileSync(p, s);
}

function migrateObservability() {
  const base = join(ROOT, "features/observability/src");
  ensureDir(join(base, "core/client"));
  const oldPanel = join(base, "client/client.sentry-test-panel.tsx");
  const newPanel = join(
    base,
    "core/client/observability.sentry-test-panel.tsx",
  );
  try {
    renameSync(oldPanel, newPanel);
  } catch {
    copyFileSync(
      join(base, "core/client/observability.sentry-test-panel.tsx"),
      newPanel,
    );
  }
  rmSync(join(base, "client"), { recursive: true, force: true });
  writeFileSync(
    join(base, "core/client/index.ts"),
    `export { SentryTestPanel } from "./observability.sentry-test-panel";
`,
  );
}

migrateDataTable();
migrateShell();
migratePatterns();
migrateApi();
migrateAuthorizationBarrels();
migrateAuthentication();
fixNotificationsIndex();
migrateObservability();
console.log("Feature file restructure done.");
