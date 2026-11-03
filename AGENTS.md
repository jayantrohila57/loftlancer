# Agent & contributor workflow

This repository uses **`dev`** for integration and **`main`** for production. All work is tracked in GitHub.

## Issues first

- Every **task**, **bug**, and **docs** change starts as a [GitHub issue](https://github.com/jayantrohila57/loftlancer/issues) on the **loftlancer** GitHub Project.
- **Cloud agents and automated workers must only implement work that is tied to an open issue** (title/description or explicit issue number in the handoff).
- **Parent issues** describe outcomes; **sub-task issues** (template: *Sub-task*) are the units agents implement — one verifiable chunk each, not one giant issue in a single PR.
- Commits that complete sub-issue work use the footer: **`Fixes #<sub-issue>`** (or `Closes #<sub-issue>`). Use **`Refs #<parent>`** while the parent stays open.

## Strict agent workflow

Cursor rule **`.cursor/rules/agent-workflow.mdc`** (Cursor only; Codex: nested **`AGENTS.md`** + **`.codex/hooks.json`**). Summary:

| # | Rule |
|---|------|
| 1 | **Never** ship by breaking architecture rules (audit, oRPC, module layout, thin routes). No “temporary” bypasses. |
| 2 | Work **sub-issues**, not whole parent issues in one go. |
| 3 | **Branch** from `dev` per parent issue; **one commit per sub-issue**; before merging to **`dev`**, run **`pnpm verify:dev-merge`** on the full branch. |
| 4 | **Plan** before coding; small/fast models execute [new-feature-checklist.md](./docs/new-feature-checklist.md) **one section at a time**. |
| 5 | **Migration:** new code follows **`module/`** + oRPC — not legacy `apps/studio/src/module/*` or `packages/api/src/modules/*` as templates. |
| 6 | **Reference** `module/<domain>/` and `module/shared/` first; legacy paths are read-only for behavior, not copy sources. |
| 7 | **Blocked dependency:** stop; add **`## TODO (blocked)`** in **`module/<domain>/README.md`** (and optional `// TODO(#issue)` in code). |
| 8 | **Operational docs** for a domain live in **`module/<domain>/README.md`** ([README.template.md](./module/README.template.md)), not new long runbooks under `docs/`. |

Mechanical gates: **`pnpm audit:module-architecture`** (module/oRPC contracts) and **`pnpm audit:architecture-layers`** (Apps → Modules → Features → Packages imports). CI fails on **new** violations. Full pre-merge stack: **`pnpm verify:dev-merge`**.

## Monorepo architecture

The monorepo follows **Apps → Modules → Features → Packages**. **Apps** handle routing, layouts, and composition. **Modules** (`module/`) contain complete domain-specific functionality—server APIs, business logic, repositories, policies, permissions and action IDs, schemas, types, and client components. **Features** (`features/`) provide reusable, domain-independent systems such as RBAC/ABAC authorization, role management, forms, data tables, API middleware, validation, auditing, logging, and notifications that any module can consume. **Packages** (`packages/`) are strictly responsible for third-party integrations, SDK initialization, and low-level adapters (Drizzle, Better Auth, PostHog, Redis, email providers) without business logic. Each module and feature maintains **`server/`**, **`client/`**, and **`shared/`** (or **`utils/`** in modules per [naming.md](./docs/naming.md)) where applicable. Dependencies flow **apps → modules → features → packages**; features never import modules. Platform contracts: [docs/features.md](./docs/features.md), [docs/modules.md](./docs/modules.md), [docs/packages.md](./docs/packages.md). Per-domain runbooks stay in **`module/<domain>/README.md`** or **`features/<name>/README.md`**, not long docs under `docs/`.

**Codex (OpenAI CLI / IDE / GitHub):** loads this file plus nested **`AGENTS.md`** (`module/`, `module/teams/`, `packages/api/`). Setup and Stop hook: **[.codex/README.md](./.codex/README.md)**. Cursor-only rules live under **`.cursor/rules/`** — Codex does not read `.mdc` files unless you paste them into AGENTS.md.

## Code Review Rules

For **Codex code review on GitHub** and human reviewers — flag or request changes when:

- A PR adds **new** architecture audit violations (run **`pnpm audit:module-architecture`** locally; compare to baseline).
- New **tRPC** product procedures, **`z.unknown()`** oRPC inputs, or controllers missing outbound **`serviceResponseSchema(...).parse`**.
- Domain logic in **`apps/*/src/app/**/page.tsx`** or new product code under **`packages/api/src/modules/*`** instead of **`module/<domain>/`**.
- Implementation clearly **copied from legacy** `apps/studio/src/module/*` rather than module/gap patterns.
- A single PR tries to close a **whole parent issue** without sub-issue breakdown, or merges without **`pnpm verify:dev-merge`** evidence on the branch.
- Operational notes added under **`docs/`** that belong in **`module/<domain>/README.md`**.

Safe path: thin oRPC → module controller → **`runAction`**; reference **`module/teams/`** or **`module/shared/`**; blocked deps documented in module README **TODO (blocked)**.

## Git & deploy

| Rule        | Detail                                                                                                              |
| ----------- | ------------------------------------------------------------------------------------------------------------------- |
| Branches    | Feature branch (e.g. `chore/…`, `fix/…`) → merge into **`dev`** → merge **`dev`** into **`main`**                   |
| **`main`**  | **Release-only.** No direct commits or pushes for ordinary work — not for small tasks, docs, or CI-only edits       |
| Integration | **`dev`** holds merged work; push `dev` after feature merges (no Vercel production deploy)                          |
| Production  | **`main` only** — Vercel production deploys when `main` is pushed (via **`dev` → `main`** merge)                  |
| Vercel      | Per-app `vercel.json` sets `git.deploymentEnabled` so only **`main`** builds; `ignoreCommand` skips non-`main` refs |
| Before push | `git pull --rebase` on the branch you are updating                                                                  |
| Forbidden   | Direct commits on **`main`**; push to **`origin/main`** except **`dev` → `main`** release; force-push; `git commit --amend` on shared history |
| PRs         | Target **`dev`**. **`main`** PRs only for promoting **`dev`** (release). Merges may be on GitHub or locally on those branches |

## Versioning & releases

- Add a line under `## [Unreleased]` in [CHANGELOG.md](./CHANGELOG.md) for every change merged into **`dev`**.
- Release procedure: [docs/releasing.md](./docs/releasing.md).

## Documentation

Product, UI, permissions, deploy, and database rules are **not** duplicated here.

- **Doc map:** [docs/index.md](./docs/index.md) — platform contracts and gaps index
- **Per-domain runbooks:** **`module/<domain>/README.md`** (agents read this first for the domain they touch)
- **Prescriptive gaps (greenfield):** [docs/architecture-gaps.md](./docs/architecture-gaps.md) · [docs/new-feature-checklist.md](./docs/new-feature-checklist.md)
- **File naming:** [docs/naming.md](./docs/naming.md) — `utils.` / `server.` / `client.` prefix + role postfix
- **UI/UX:** [docs/ui-ux-skills.md](./docs/ui-ux-skills.md) — read `.agents/skills/*/SKILL.md` before building or reviewing UI
- **New product code:** `module/<domain>/` + oRPC only — **do not add tRPC procedures**; cross-domain reuse → **`features/`**; follow gaps docs, not legacy app paths as templates
- **Architecture gates:** **`pnpm audit:module-architecture`** and **`pnpm audit:architecture-layers`** before finishing layer work; CI fails on **new** violations ([docs/tooling.md](./docs/tooling.md))
- **Server APIs:** [docs/server-api.md](./docs/server-api.md)
- **Rendering:** [docs/rendering.md](./docs/rendering.md)
- **UI/UX skills:** [docs/ui-ux-skills.md](./docs/ui-ux-skills.md)
- **Actions & events:** [docs/actions-and-events.md](./docs/actions-and-events.md)
- **Data workflow:** [docs/data-workflow.md](./docs/data-workflow.md)
- **Layouts & routes:** [docs/layouts.md](./docs/layouts.md)
- **App states:** [docs/app-states.md](./docs/app-states.md)
- **Domain modules:** [docs/modules.md](./docs/modules.md)
- **Reusable features:** [docs/features.md](./docs/features.md)
- **Platform packages:** [docs/packages.md](./docs/packages.md) — `packages/` infra; thin oRPC in `@loftlancer/api`
- **Run locally:** [README.md](./README.md)

## Commands (root)

```bash
pnpm install
pnpm dev:web
pnpm build
pnpm check-types
pnpm audit:module-architecture
pnpm audit:architecture-layers
pnpm verify:dev-merge   # before merging issue branch to dev
pnpm db:push
pnpm db:reset-seed   # destructive — see docs/database.md
```

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
