# Domain modules (`module/`)

Product **domain** code lives here: `module/<domain>/{utils,server,client}/`. Cross-domain reusable platform code belongs in **`features/`** ([docs/features.md](../docs/features.md)), not new folders under `module/` unless it is a full product domain.

**Stack:** Apps → Modules → Features → Packages — [docs/features.md](../docs/features.md) · [docs/modules.md](../docs/modules.md)

### Import aliases

| Layer    | Alias        | Example                               |
| -------- | ------------ | ------------------------------------- |
| Apps     | `@/`         | `@/app/layout`                        |
| Modules  | `@modules/`  | `@modules/teams/server`               |
| Features | `@features/` | `@features/authorization/core/server` |
| Packages | `@packages/` | `@packages/drizzle`                   |

Prefer **`@modules/*`** for new code; dual **`@module/*`** still resolves to the same tree ([docs/tooling.md](../docs/tooling.md)).

**Per-domain runbooks:** **`module/<domain>/README.md`** ([README.template.md](./README.template.md)) — agents update the module README, not new long docs under `docs/`.

**Tier 1 shell** (sidebar, header, inset) → `module/studio-shell/`; **Tier 2** sub-header/tabs → each module `client/studio/layout/`.

Cross-module server/utils without a domain home: **`module/shared/`** ([shared/README.md](./shared/README.md)).

## Kept domains (modules layer)

| Domain         | Notes                                                                             |
| -------------- | --------------------------------------------------------------------------------- |
| `account`      | Auth settings; target `module/account/` (migrate from `apps/auth/src/module/`)    |
| `studio-shell` | Tier 1 Studio shell ([studio-shell/README.md](./studio-shell/README.md))          |
| `shared`       | Cross-domain helpers that stay in the module layer until extracted to `features/` |

## Domains in migration or legacy

These folders may still exist during migration; new cross-cutting UI or policy engines should move to **`features/`** when domain-independent. Studio legacy paths remain under `apps/studio/src/module/` until retired.

| Domain          | Studio (legacy)                        | Notes                                                                                                             |
| --------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `ai`            | —                                      | `module/ai/server/api/*` — [ai/README.md](./ai/README.md)                                                         |
| `apps`          | `apps/studio/src/module/apps`          | Marketplace / installed apps (not Next.js `apps/`); server logic in `module/apps/server/`                         |
| `environments`  | `apps/studio/src/module/environments`  | Server logic in `module/environments/server/`                                                                     |
| `files`         | —                                      | `module/files/server/api/*` — [files/README.md](./files/README.md)                                                |
| `organizations` | `apps/studio/src/module/organizations` | [organizations/README.md](./organizations/README.md)                                                              |
| `projects`      | `apps/studio/src/module/projects`      | Server/utils in `module/projects/`                                                                                |
| `support`       | `apps/studio/src/module/support`       |                                                                                                                   |
| `teams`         | `module/teams/client/studio`           | Pilot — [teams/README.md](./teams/README.md); [docs/reference-module-teams.md](../docs/reference-module-teams.md) |

**Studio-only (no `module/<domain>/` folder yet):** `activity`, `overview`, `tasks`, `notifications` — live under `apps/studio/src/module/*` until migrated.
