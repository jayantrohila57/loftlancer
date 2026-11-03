# Architecture gaps (prescriptive rules)

Greenfield target architecture is documented in [modules.md](./modules.md), [data-workflow.md](./data-workflow.md), and related docs. **These gap files spell out what agents must not invent** — exact contracts, paths, templates, and forbidden defaults.

**Start here when implementing new code:**

1. [new-feature-checklist.md](./new-feature-checklist.md) — ordered checklist for a new feature
2. [reference-module-teams.md](./reference-module-teams.md) — canonical end-to-end example module
3. [tooling.md](./tooling.md) — **`@modules/*`**, **`@features/*`**, **`@packages/*`** paths and typecheck

---

## Gap index (by category)

| Doc                                                                  | Topic                                            | If missing, AI tends to…                              |
| -------------------------------------------------------------------- | ------------------------------------------------ | ----------------------------------------------------- |
| [ui-ux-skills.md](./ui-ux-skills.md)                                 | Which agent skills to read for UI                | Invent components, skip a11y, ignore `@loftlancer/ui` |
| [gaps/contracts.md](./gaps/contracts.md)                             | ServiceResponse, service outcome, field errors   | Invent random JSON shapes and status strings          |
| [gaps/imports-paths.md](./gaps/imports-paths.md)                     | Import aliases, client entrypoints               | Deep relative imports, duplicate tRPC clients         |
| [gaps/orpc-transport.md](./gaps/orpc-transport.md)                   | Procedures, context, HTTP policy                 | Put domain logic in `packages/orpc` or apps           |
| [gaps/server-folders.md](./gaps/server-folders.md)                   | controller / service / page / handlers / actions | Duplicate loaders and fat app routes                  |
| [gaps/client-layer.md](./gaps/client-layer.md)                       | Hooks, boundaries, toast, dynamic islands        | Inline switches, wrong empty/loading semantics        |
| [gaps/layouts-routes.md](./gaps/layouts-routes.md)                   | Tier 1/2, route config, account shell            | Copy ad hoc layout JSX in apps                        |
| [gaps/actions-audit.md](./gaps/actions-audit.md)                     | runAction, emitActionEvent, deny → failed        | Skip audit, throw on expected deny                    |
| [gaps/forbidden-defaults.md](./gaps/forbidden-defaults.md)           | Packages vs module, tRPC, page size              | New `@loftlancer/teams` packages, tRPC procedures     |
| [gaps/agent-meta.md](./gaps/agent-meta.md)                           | Doc read order, Cursor rules                     | Pick legacy patterns or skip access-control           |
| [gaps/priority-implementation.md](./gaps/priority-implementation.md) | Shared layer build order                         | Implement features before contracts exist             |

---

## Canonical code locations (shared layer)

| Need                     | Path                                                                  |
| ------------------------ | --------------------------------------------------------------------- |
| ServiceResponse types    | `module/shared/utils/types/utils.service-response.types.ts`           |
| Zod + factories          | `module/shared/utils/validation/utils.service-response.validation.ts` |
| Internal service outcome | `module/shared/utils/types/utils.service-outcome.types.ts`            |
| Response → UI props      | `module/shared/utils/state/utils.response-to-ui.mapper.ts`            |
| Mutations wrapper        | `module/shared/server/run-action.ts`                                  |
| Server events            | `module/shared/server/events/emit-action-event.ts`                    |
| Toast from response      | `module/shared/client/apply-response-toast.ts`                        |
| Client intent breadcrumb | `module/shared/client/track-action-intent.ts`                         |

Implementations may be thin until wired to `@loftlancer/orpc`; **signatures and types are the contract** — do not replace them with ad hoc alternatives.

---

## Related

- [index.md](./index.md) — full doc map
- [data-workflow.md](./data-workflow.md) — ServiceResponse pipeline
- [actions-and-events.md](./actions-and-events.md) — action IDs and audit
