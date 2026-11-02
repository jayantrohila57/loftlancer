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

- Add a line under `## [Unreleased]` in [CHANGELOG.md](./CHANGELOG.md) for every change merged into **`dev`**.
- Release procedure: [docs/releasing.md](./docs/releasing.md).

## Documentation

Product, UI, permissions, deploy, and database rules are **not** duplicated here.

- **Doc map:** [docs/index.md](./docs/index.md)
- **Prescriptive gaps (greenfield):** [docs/architecture-gaps.md](./docs/architecture-gaps.md) · [docs/new-feature-checklist.md](./docs/new-feature-checklist.md)
- **File naming:** [docs/naming.md](./docs/naming.md) — `utils.` / `server.` / `client.` prefix + role postfix
- **UI/UX:** [docs/ui-ux-skills.md](./docs/ui-ux-skills.md) — read `.agents/skills/*/SKILL.md` before building or reviewing UI
- **New product code:** `module/<feature>/` + oRPC only — **do not add tRPC procedures**; follow gaps docs, not legacy app paths as templates
- **Server APIs:** [docs/server-api.md](./docs/server-api.md)
- **Rendering:** [docs/rendering.md](./docs/rendering.md)
- **UI/UX skills:** [docs/ui-ux-skills.md](./docs/ui-ux-skills.md)
- **Actions & events:** [docs/actions-and-events.md](./docs/actions-and-events.md)
- **Data workflow:** [docs/data-workflow.md](./docs/data-workflow.md)
- **Layouts & routes:** [docs/layouts.md](./docs/layouts.md)
- **App states:** [docs/app-states.md](./docs/app-states.md)
- **Feature modules:** [docs/modules.md](./docs/modules.md)
- **Platform packages:** [docs/packages.md](./docs/packages.md) — `packages/` infra; thin oRPC in `@loftlancer/api`
- **Run locally:** [README.md](./README.md)

## Commands (root)

```bash
pnpm install
pnpm dev:web
pnpm build
pnpm check-types
pnpm db:push
pnpm db:reset-seed   # destructive — see docs/database.md
```

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
