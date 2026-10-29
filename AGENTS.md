# Agent & contributor workflow

This repository uses **`dev`** for integration and **`main`** for production. All work is tracked in GitHub.

## Issues first

- Every **task**, **bug**, and **docs** change starts as a [GitHub issue](https://github.com/jayantrohila57/loftlancer/issues) on the **loftlancer** GitHub Project.
- **Cloud agents and automated workers must only implement work that is tied to an open issue** (title/description or explicit issue number in the handoff).
- Commits that complete issue work use the footer: **`Fixes #<number>`** (or `Closes #<number>`).

## Git & deploy

| Rule | Detail |
|------|--------|
| Branches | Feature branch (e.g. `chore/…`, `fix/…`) → merge into **`dev`** → merge **`dev`** into **`main`** |
| Integration | **`dev`** holds merged work; push `dev` after feature merges (no Vercel production deploy) |
| Production | **`main` only** — Vercel production deploys when `main` is pushed |
| Vercel | Per-app `vercel.json` sets `git.deploymentEnabled` so only **`main`** builds; `ignoreCommand` skips non-`main` refs |
| Before push | `git pull --rebase` on the branch you are updating |
| Forbidden | Force-push, `git commit --amend` on shared history |
| PRs | Optional; merges may be direct on GitHub or locally |

## Versioning & releases

- One product version in the root `package.json` (semver). Every `dev` → `main` release bumps it (minor for features, patch for fix batches), adds a dated `CHANGELOG.md` entry, and after the merge gets a `vX.Y.Z` tag and a GitHub Release (`pnpm release:publish`).
- Add a line under `## [Unreleased]` in `CHANGELOG.md` with every change you merge into `dev`.
- Full procedure: [docs/RELEASING.md](./docs/RELEASING.md).

## What to read before coding

| Topic | Document |
|-------|----------|
| Monorepo & run locally | [README.md](./README.md) |
| UI architecture & modules | [UI.md](./UI.md), [docs/MODULE_ARCHITECTURE.md](./docs/MODULE_ARCHITECTURE.md) |
| Spacing, coss ui, layout tokens | [docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md) |
| Roles, actions, audit | [docs/ACTIONS_PERMISSIONS_AUDIT.md](./docs/ACTIONS_PERMISSIONS_AUDIT.md) |
| Soft deletes | [docs/SOFT_DELETES.md](./docs/SOFT_DELETES.md) |
| DB reset + seed (prod) | [docs/DB_RESET.md](./docs/DB_RESET.md) |
| Platform apps & SSO | [docs/PLAN_PLATFORM_APPS.md](./docs/PLAN_PLATFORM_APPS.md) |
| Future MCP / console | [docs/PLAN_MCP_AND_CONSOLE.md](./docs/PLAN_MCP_AND_CONSOLE.md) |
| Production deploy (Vercel, flags, rate limits) | [docs/PRODUCTION_DEPLOY.md](./docs/PRODUCTION_DEPLOY.md) |

## Product rules (short)

- **Organizations:** Multi-tenant workspaces with **Owner / Manager / Member** (legacy DB `admin` → Manager). **Platform Admin** is reserved in `@loftlancer/actions` but not enabled in production UI.
- **Teams** and **per-project CRUD grants** (`project_manager`, `project_team`, `project_member_grant`) layer on org roles.
- **Canonical actions** in `@loftlancer/actions` drive `requireAction`, blocks, audit, and UI gates.
- **Audit:** Prefer `audit_event` + Timeline routes when `ACTIONS_AUDIT_ENABLED=true`.
- **Soft deletes:** When `SOFT_DELETES_ENABLED=true`, user-facing deletes set `deleted_at` / `deleted_by`.
- **Notifications:** `@loftlancer/notifications` when `NOTIFICATIONS_ENABLED=true`.
- **Account settings** (`/dashboard/settings/*`): user scope only. **Org administration** lives under **`/dashboard/organizations`**.

## UI rule for agents

- **shadcn / coss ui primitives** live only in `packages/ui/src/components/ui/` (imported as `@loftlancer/ui/<name>`; apps keep no `components/ui` copies). Shared patterns (empty/page states, shell pieces, guards) live in `packages/ui/src/patterns/` (`@loftlancer/ui/patterns/<name>`). They are the single source of truth for spacing and layout; compose via [docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md) tokens (`layout-spacing.ts`, `PageHeaderBar`, `FormSheet`, etc.).
- **Do not edit `packages/ui/src/components/ui/*`** except via the documented shadcn/coss CLI workflow.
- After UI changes, **verify in a running dev build** (`pnpm dev:web`) — layout, empty/error states, and org/project gates.

## Database / production schema

- Major schema changes ship as **reviewed SQL** (e.g. `0007_platform_combined_for_prod.sql`). See [docs/PLATFORM_MIGRATION_COMBINED.md](./docs/PLATFORM_MIGRATION_COMBINED.md).
- On intentional prod schema cut: **Neon backup branch first**, apply migration, enable flags, then optional **`pnpm db:reset-seed`** per [docs/DB_RESET.md](./docs/DB_RESET.md) (keeps owner account; requires explicit `RESET_CONFIRM`).

## Commands (root)

```bash
pnpm install
pnpm dev:web
pnpm build
pnpm check-types
pnpm db:push
pnpm db:reset-seed   # destructive — see docs/DB_RESET.md
```

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
