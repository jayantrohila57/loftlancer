# Feature modules

Product feature code lives here: `module/<domain>/{utils,server,client}/`. Cross-feature server/utils: **`module/shared/`** ([shared/README.md](./shared/README.md)).

**Rules:** [docs/modules.md](../docs/modules.md) · platform gaps in [docs/architecture-gaps.md](../docs/architecture-gaps.md)

**Per-domain runbooks:** **`module/<domain>/README.md`** ([README.template.md](./README.template.md)) — agents update the module README, not new long docs under `docs/`.

**Tier 1 shell** (sidebar, header, inset) → `module/studio-shell/` when rewritten; **Tier 2** sub-header/tabs → each module `client/studio/layout/`.

| Domain | Studio (legacy) | Notes |
|--------|-----------------|--------|
| `activity` | `apps/studio/src/module/activity` | |
| `ai` | — | API partially in `packages/api/src/modules/ai` |
| `apps` | `apps/studio/src/module/apps` | Marketplace / installed apps |
| `environments` | `apps/studio/src/module/environments` | |
| `files` | — | API in `packages/api/src/modules/files` |
| `notifications` | `apps/studio/src/module/notifications` | |
| `organizations` | `apps/studio/src/module/organizations` | |
| `overview` | `apps/studio/src/module/overview` | Org home |
| `projects` | `apps/studio/src/module/projects` | |
| `support` | `apps/studio/src/module/support` | |
| `tasks` | `apps/studio/src/module/tasks` | |
| `teams` | `module/teams/client/studio` | `/[org]/teams/...` pilot — **[teams/README.md](./teams/README.md)** (source of truth); tree reference [docs/reference-module-teams.md](../docs/reference-module-teams.md) |
| `studio-shell` | — | Tier 1 Studio shell ([studio-shell/README.md](./studio-shell/README.md)) |
| `account` | `apps/auth/src/module/` (legacy) | Auth settings; target `module/account/` |

Auth settings / consent migrate from `apps/auth/src/module/` into **`module/account/`**.
