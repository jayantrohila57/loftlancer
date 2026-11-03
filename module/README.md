# Domain modules (`module/`)

Product **domain** code lives here: `module/<domain>/{utils,server,client}/`. Cross-domain reusable platform code belongs in **`features/`** ([docs/features.md](../docs/features.md)), not new folders under `module/` unless it is a full product domain.

**Stack:** Apps → Modules → Features → Packages — [docs/features.md](../docs/features.md) · [docs/modules.md](../docs/modules.md)

**Per-domain runbooks:** **`module/<domain>/README.md`** ([README.template.md](./README.template.md)) — agents update the module README, not new long docs under `docs/`.

**Tier 1 shell** (sidebar, header, inset) → `module/studio-shell/`; **Tier 2** sub-header/tabs → each module `client/studio/layout/`.

Cross-module server/utils without a domain home: **`module/shared/`** ([shared/README.md](./shared/README.md)).

## Kept domains (modules layer)

| Domain | Notes |
|--------|--------|
| `account` | Auth settings; target `module/account/` (migrate from `apps/auth/src/module/`) |
| `studio-shell` | Tier 1 Studio shell ([studio-shell/README.md](./studio-shell/README.md)) |
| `shared` | Cross-domain helpers that stay in the module layer until extracted to `features/` |

## Domains in migration or legacy

These folders may still exist during migration; new cross-cutting UI or policy engines should move to **`features/`** when domain-independent. Studio legacy paths remain under `apps/studio/src/module/` until retired.

| Domain | Studio (legacy) | Notes |
|--------|-----------------|--------|
| `activity` | `apps/studio/src/module/activity` | |
| `ai` | — | Partial API in `packages/api/src/modules/ai` |
| `apps` | `apps/studio/src/module/apps` | Marketplace / installed apps (not Next.js `apps/`) |
| `environments` | `apps/studio/src/module/environments` | |
| `files` | — | API in `packages/api/src/modules/files` |
| `notifications` | `apps/studio/src/module/notifications` | Candidate for `features/notifications/` |
| `organizations` | `apps/studio/src/module/organizations` | [organizations/README.md](./organizations/README.md) |
| `overview` | `apps/studio/src/module/overview` | Org home |
| `projects` | `apps/studio/src/module/projects` | |
| `support` | `apps/studio/src/module/support` | |
| `tasks` | `apps/studio/src/module/tasks` | |
| `teams` | `module/teams/client/studio` | Pilot — [teams/README.md](./teams/README.md); [docs/reference-module-teams.md](../docs/reference-module-teams.md) |
