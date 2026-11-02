# Gap: agent meta (docs and rules)

**Purpose:** Agents skip access-control or pick wrong doc order. This file defines **read order** and **Cursor rule** coverage.

---

## Read order (new feature)

1. [new-feature-checklist.md](../new-feature-checklist.md)  
2. [naming.md](../naming.md)  
3. [ui-ux-skills.md](../ui-ux-skills.md) — before any `client/` or `@loftlancer/ui` work  
4. [reference-module-teams.md](../reference-module-teams.md)  
5. [architecture-gaps.md](../architecture-gaps.md) → relevant `gaps/*.md`  
6. [product.md](../product.md) — registry row for each gated action  
7. Domain docs: [data-workflow.md](../data-workflow.md), [server-api.md](../server-api.md), [layouts.md](../layouts.md), [rendering.md](../rendering.md), [app-states.md](../app-states.md), [access-control.md](../access-control.md), [actions-and-events.md](../actions-and-events.md)

---

## AGENTS.md policy (agents)

- **New code:** oRPC + `module/` only — **tRPC forbidden** for new endpoints.  
- **Do not** use legacy app paths as implementation templates — follow `docs/` and `gaps/`.  
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

When editing matching globs, read the linked doc section first.

---

## Living checklist

Track prescriptive holes closed vs open in [priority-implementation.md](./priority-implementation.md). Update when shared code is wired (not just stubbed).

---

## Related

- [index.md](../index.md)  
