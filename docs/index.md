# Loftlancer documentation

All coding and ops docs live in this folder (flat). GitHub-facing files stay at the repo root: `README.md`, `CHANGELOG.md`, `AGENTS.md`, `CONTRIBUTING.md`, `SECURITY.md`.

| Document | Purpose |
|----------|---------|
| [ui-ux-skills.md](./ui-ux-skills.md) | **Agent UI/UX skills** — when to read shadcn, coss, ui-ux-pro-max, impeccable, etc. |
| [naming.md](./naming.md) | **File/folder naming** — layer prefix, role postfix, searchable kebab-case |
| [architecture-gaps.md](./architecture-gaps.md) | **Prescriptive gaps** — index to `docs/gaps/*` (stop AI improvisation) |
| [new-feature-checklist.md](./new-feature-checklist.md) | Ordered checklist for new `module/<feature>/` work |
| [reference-module-teams.md](./reference-module-teams.md) | Canonical greenfield **`module/teams`** tree + read/write flow |
| [tooling.md](./tooling.md) | **`@module/*`** tsconfig paths and typecheck |
| [access-control.md](./access-control.md) | **RBAC + ABAC** — roles, attributes, grants, evaluator |
| [actions-and-events.md](./actions-and-events.md) | Action IDs, audit, events |
| [data-workflow.md](./data-workflow.md) | **ServiceResponse** — success / failed / error; toast + UI |
| [database.md](./database.md) | Schema sync (`db:push`), local DB, reset-seed |
| [integrations.md](./integrations.md) | Services inventory — update when env/services change |
| [layouts.md](./layouts.md) | **Module routes & layouts** — Tier 1 shell + Tier 2 section (sub-header/tabs) |
| [app-states.md](./app-states.md) | **App Router states** — loading/error/not-found/forbidden |
| [rendering.md](./rendering.md) | **UI composition** — logic in functions, dynamic client islands |
| [server-api.md](./server-api.md) | **Server APIs** — oRPC-only (target), module/server, bare Next `app/` |
| [modules.md](./modules.md) | **`module/`** — product feature code (ownership, internal layout) |
| [packages.md](./packages.md) | **`packages/`** — platform; `@loftlancer/api` = oRPC transport shell |
| [product.md](./product.md) | Permissions / audit recipe (code is the spec) |
| [releasing.md](./releasing.md) | Semver, changelog, release workflow |
| [../CHANGELOG.md](../CHANGELOG.md) | Release notes (Keep a Changelog; stays at repo root) |

**Gap detail (by topic):** [ui-ux-skills.md](./ui-ux-skills.md) · [naming.md](./naming.md) · [gaps/contracts.md](./gaps/contracts.md) · [imports-paths.md](./gaps/imports-paths.md) · [orpc-transport.md](./gaps/orpc-transport.md) · [server-folders.md](./gaps/server-folders.md) · [client-layer.md](./gaps/client-layer.md) · [layouts-routes.md](./gaps/layouts-routes.md) · [actions-audit.md](./gaps/actions-audit.md) · [forbidden-defaults.md](./gaps/forbidden-defaults.md) · [agent-meta.md](./gaps/agent-meta.md) · [priority-implementation.md](./gaps/priority-implementation.md)

Contributors and agents: start with [../AGENTS.md](../AGENTS.md), [new-feature-checklist.md](./new-feature-checklist.md), and [architecture-gaps.md](./architecture-gaps.md), then use this index.
