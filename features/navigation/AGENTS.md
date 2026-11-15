# Feature `navigation`

Central **navigation registry** for sidebar, header, command search, and tabs. **Domain-specific** href trees stay in `@modules/*`; register items at app or module boundaries.

| Path                                  | Role                                            |
| ------------------------------------- | ----------------------------------------------- |
| `capability/navigation.registry.ts`   | `createNavigationRegistry`, validation          |
| `utils/navigation.shell-adapters.ts`  | Map registry → shell-shaped groups/tabs/command |
| `capability/navigation.home-items.ts` | Default studio/console home sidebar slice       |

Consumers import `@features/navigation`. Adapter output is structurally compatible with `@features/shell` nav types.
