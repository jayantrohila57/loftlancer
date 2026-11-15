# Feature `action`

Central **action registry** for toolbar, menus, command palette, context menus, and bulk bars. **Server audit action ids** and Zod metadata stay in `@modules/activity` (`activity.actions.ts`); link UI actions via optional `activityActionId` when recording events.

| Path                             | Role                                           |
| -------------------------------- | ---------------------------------------------- |
| `capability/action.registry.ts`  | `createActionRegistry`, validation             |
| `utils/action.shell-adapters.ts` | Map registry → command / toolbar / menu shapes |

Consumers import `@features/action`. Use `handler.kind`: `href` (navigate), `intent` (dispatch string), or `run` (client callback).

**Activity bridge:** set `activityActionId` to a key from `activityActions` when the UI action should emit the same audit id; do not duplicate activity schemas in this feature.
