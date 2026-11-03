# Feature modules

Product feature code lives here: `module/<domain>/{utils,server,client}/`. Cross-feature server/utils: **`module/shared/`** ([shared/README.md](./shared/README.md)).

**Rules:** [docs/modules.md](../docs/modules.md) · platform gaps in [docs/architecture-gaps.md](../docs/architecture-gaps.md)

**Per-domain runbooks:** **`module/<domain>/README.md`** ([README.template.md](./README.template.md)).

## Product reset (2026-11)

Removed domain modules (business logic + Studio surfaces):

- `teams`
- `organizations`
- `projects`
- `apps` (marketplace / installed apps — **not** the Next.js `apps/` workspace)

Removed empty/stub domains (README-less `.gitkeep` scaffolds only):

- `activity`
- `ai`
- `environments`
- `files`
- `notifications`
- `overview`
- `support`
- `tasks`

**Kept:**

| Domain | Notes |
|--------|--------|
| `account` | Auth settings; target `module/account/` |
| `studio-shell` | Tier 1 Studio shell |
| `shared` | Cross-feature helpers |

Auth / Better Auth organization **plugin** may still exist in `packages/` as infrastructure; product org/team/project **module** code is gone. Studio may still host legacy UI under `apps/studio/src/module/` for non-reset surfaces (activity, notifications, support, etc.) until those migrate or are retired.
