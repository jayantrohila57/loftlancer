# Documentation (single index)

**Agents:** start here — not scattered `{layer}/docs/` folders.

| Step           | Doc                                                                           |
| -------------- | ----------------------------------------------------------------------------- |
| Layer roles    | [layers.md](./layers.md)                                                      |
| Classify work  | [workflow/01-classify.md](./workflow/01-classify.md)                          |
| Setup order    | [workflow/02-setup-order.md](./workflow/02-setup-order.md)                    |
| Rename / split | [workflow/03-split.md](./workflow/03-split.md)                                |
| Verify         | [verify/commands.md](./verify/commands.md) · [i18n results](./verify/i18n.md) |
| Release        | [releasing.md](./releasing.md) · [../CHANGELOG.md](../CHANGELOG.md)           |

Current Auth and Account progress: [Auth and Account roadmap](./work/auth-account-roadmap.md).

## Apps (`docs/apps/`)

| Doc                                                                 | Topic                  |
| ------------------------------------------------------------------- | ---------------------- |
| [purpose-and-scope.md](./apps/purpose-and-scope.md)                 | Role                   |
| [routing-shell.md](./apps/routing-shell.md)                         | Routes only            |
| [page-convention.md](./apps/page-convention.md)                     | `@modules/*` re-export |
| [route-layouts.md](./apps/route-layouts.md)                         | Layout tree            |
| [app-shared.md](./apps/app-shared.md)                               | `src/shared/`          |
| [cache-components.md](./apps/cache-components.md)                   | PPR + `'use cache'`    |
| [conventions.md](./apps/conventions.md)                             | Imports, proxy         |
| [tree.md](./apps/tree.md)                                           | Folder tree            |
| [package-json-and-tsconfig.md](./apps/package-json-and-tsconfig.md) | tsconfig               |
| [new-app-checklist.md](./apps/new-app-checklist.md)                 | New app                |
| [web-dev.md](./apps/web-dev.md)                                     | Web dev URLs           |
| [studio-dev.md](./apps/studio-dev.md)                               | Studio dev URLs        |
| [console-dev.md](./apps/console-dev.md)                             | Console dev URLs       |
| [auth-dev.md](./apps/auth-dev.md)                                   | Auth `/auth` dev URLs  |
| [vercel-deploy.md](./apps/vercel-deploy.md)                         | Vercel Services deploy |

Layer router: [../apps/AGENTS.md](../apps/AGENTS.md)

## Modules (`docs/modules/`)

| Doc                                                          | Topic                      |
| ------------------------------------------------------------ | -------------------------- |
| [purpose-and-layer.md](./modules/purpose-and-layer.md)       | Role                       |
| [domain-architecture.md](./modules/domain-architecture.md)   | Start here                 |
| [ui-tree.md](./modules/ui-tree.md)                           | Server-first, PPR          |
| [organism-components.md](./modules/organism-components.md)   | Screen & client-leaf rules |
| [api-structure.md](./modules/api-structure.md)               | oRPC and React Query       |
| [activity-and-logging.md](./modules/activity-and-logging.md) | Activity and logging rules |
| [health-checks.md](./modules/health-checks.md)               | DB readiness API           |
| [internal-shared.md](./modules/internal-shared.md)           | `shared/`, `shell`         |
| [tree-and-scaffold.md](./modules/tree-and-scaffold.md)       | Scaffold                   |
| [wiring.md](./modules/wiring.md)                             | tsconfig paths             |
| [new-module.md](./modules/new-module.md)                     | New slug                   |
| [migrate-rename.md](./modules/migrate-rename.md)             | Rename                     |

Layer router: [../modules/AGENTS.md](../modules/AGENTS.md)

## Features (`docs/features/`)

| Doc                                                     | Topic                 |
| ------------------------------------------------------- | --------------------- |
| [tree-and-scaffold.md](./features/tree-and-scaffold.md) | Tree                  |
| [package-and-api.md](./features/package-and-api.md)     | Exports               |
| [organisms.md](./features/organisms.md)                 | Patterns for modules  |
| [form.md](./features/form.md)                           | Form and field policy |
| [new-feature.md](./features/new-feature.md)             | New slug              |
| [migrate-rename.md](./features/migrate-rename.md)       | Rename                |

### i18n (`docs/features/i18n/`)

| Doc                                                                          | Topic                                    |
| ---------------------------------------------------------------------------- | ---------------------------------------- |
| [regional-locales.md](./features/i18n/regional-locales.md)                   | `en-us`, URL prefix                      |
| [currency-and-measurements.md](./features/i18n/currency-and-measurements.md) | Display-only prefs; no silent conversion |
| [exports.md](./features/i18n/exports.md)                                     | Import paths                             |
| [app-files.md](./features/i18n/app-files.md)                                 | App `shared/i18n/`                       |
| [proxy-next.md](./features/i18n/proxy-next.md)                               | `proxy.ts`, next config                  |
| [layout.md](./features/i18n/layout.md)                                       | `[lang]`, RTL                            |
| [enforcement.md](./features/i18n/enforcement.md)                             | Blocking i18n checks, formats, app audit |

Capability code: [../features/i18n/AGENTS.md](../features/i18n/AGENTS.md)

Layer router: [../features/AGENTS.md](../features/AGENTS.md)

## Packages (`docs/packages/`)

| Doc                                                     | Topic       |
| ------------------------------------------------------- | ----------- |
| [tree-and-scaffold.md](./packages/tree-and-scaffold.md) | Tree        |
| [package-and-api.md](./packages/package-and-api.md)     | Exports     |
| [new-package.md](./packages/new-package.md)             | New slug    |
| [migrate-rename.md](./packages/migrate-rename.md)       | Rename      |
| [ui/coss-ui.md](./packages/ui/coss-ui.md)               | Coss UI kit |

TS config policy: [../packages/typescript-config/README.md](../packages/typescript-config/README.md)

Layer router: [../packages/AGENTS.md](../packages/AGENTS.md)

Observability and platform packages (loftlancer port):

| Package                   | Router                                                                     |
| ------------------------- | -------------------------------------------------------------------------- |
| `@packages/sentry`        | [../packages/sentry/AGENTS.md](../packages/sentry/AGENTS.md)               |
| `@packages/observability` | [../packages/observability/AGENTS.md](../packages/observability/AGENTS.md) |
| `@packages/mcp`           | [../packages/mcp/AGENTS.md](../packages/mcp/AGENTS.md)                     |
| `@packages/posthog`       | [../packages/posthog/AGENTS.md](../packages/posthog/AGENTS.md)             |
| `@packages/analytics`     | Vercel Web Analytics + Speed Insights — `packages/analytics/`              |
| `@packages/crypto`        | [../packages/crypto/AGENTS.md](../packages/crypto/AGENTS.md)               |
