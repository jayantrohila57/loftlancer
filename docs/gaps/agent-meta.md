# Gap: agent meta (docs and rules)

**Purpose:** Agents skip access-control or pick wrong doc order. This file defines **read order** and **Cursor rule** coverage.

---

## Read order (new feature)

1. **`module/<domain>/README.md`** for the domain you touch ([README.template.md](../../module/README.template.md))  
2. [new-feature-checklist.md](../new-feature-checklist.md) — **one section at a time** for small models  
3. [naming.md](../naming.md)  
4. [ui-ux-skills.md](../ui-ux-skills.md) — before any `client/` or `@loftlancer/ui` work  
5. [reference-module-teams.md](../reference-module-teams.md) — **directory tree only**; runbook in `module/teams/README.md`  
6. [architecture-gaps.md](../architecture-gaps.md) → relevant `gaps/*.md`  
7. [product.md](../product.md) — registry row for each gated action  
8. Domain docs as needed: [data-workflow.md](../data-workflow.md), [server-api.md](../server-api.md), [layouts.md](../layouts.md), [rendering.md](../rendering.md), [app-states.md](../app-states.md), [access-control.md](../access-control.md), [actions-and-events.md](../actions-and-events.md)

**Workflow:** [.cursor/rules/agent-workflow.mdc](../../.cursor/rules/agent-workflow.mdc) (always applied).

---

## AGENTS.md policy (agents)

- **Sub-issues**, not monolithic parent issues; **one commit per sub-issue**; **`pnpm verify:dev-merge`** before merge to **`dev`**.  
- **New code:** oRPC + `module/` only — **tRPC forbidden** for new endpoints.  
- **Do not** use legacy app paths as implementation templates — follow **`module/`** README + gaps docs.  
- Every task ties to an open GitHub issue ([AGENTS.md](../../AGENTS.md)).

---

## Cursor rules (`.cursor/rules/`)

| Rule file | Doc |
|-----------|-----|
| `modules-architecture.mdc` | modules, layouts, server, rendering, packages |
| `data-workflow.mdc` | ServiceResponse |
| `layouts.mdc` | Tier 1/2 |
| `actions-events.mdc` | runAction, audit, events |
| `naming.mdc` | File/folder prefixes and postfixes |
| `ui-ux.mdc` | Mandatory UI/UX agent skills |
| `access-control.mdc` | RBAC + ABAC |
| `rendering.mdc` | dynamic(), boundaries |
| `app-states.mdc` | loading/error/not-found/forbidden |
| `module-architecture-audit.mdc` | Run **`pnpm audit:module-architecture`** before finishing module/oRPC/app route work |
| `agent-workflow.mdc` | Sub-issues, commits, plan-first, module README, no legacy templates (Cursor) |

**Codex:** same policies via root + nested **`AGENTS.md`** and **[.codex/README.md](../../.codex/README.md)**; Stop hook runs architecture audit when module/oRPC/pages change.

When editing matching globs, read the linked doc section first.

---

## Before marking work done (agents)

1. Run **`pnpm audit:module-architecture`** — must exit 0 (no **new** violations vs baseline).
2. Before PR to **`dev`**: **`pnpm verify:dev-merge`** on the full issue branch.
3. If you fixed baseline debt, run **`node scripts/audit-module-architecture.mjs --write-baseline`** and commit the updated JSON in the same PR.
4. Update **`module/<domain>/README.md`** (not new `docs/` runbooks) for boundaries, TODOs, verification.
5. Do **not** treat README “pilot complete” checkboxes as overriding the audit or gap docs.

---

## Living checklist

Track prescriptive holes closed vs open in [priority-implementation.md](./priority-implementation.md). Update when shared code is wired (not just stubbed).

---

## Related

- [index.md](../index.md)  
