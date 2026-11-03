# Product domain (permissions, audit, API)

Do **not** maintain parallel spec tables in markdown. The **code is the spec**. This page is the recipe for changing product behavior safely.

**Where code lives:** product features → **[modules.md](./modules.md)**; server APIs → **[server-api.md](./server-api.md)**; platform → **[packages.md](./packages.md)**.

## Source of truth

| Topic                    | Where to look                                                                                           |
| ------------------------ | ------------------------------------------------------------------------------------------------------- |
| **Action names & roles** | `features/authorization/src/constants/authorization.registry-data.ts` → `@features/authorization/utils` |
| **Server authorization** | `requireAction` + `evaluatePermission` — [access-control.md](./access-control.md) (RBAC + ABAC)         |
| **UI gates**             | `useCan("action.name")`, `<Can action="…">` in Studio / Auth                                            |
| **Audit timeline**       | `audit_event` when `ACTIONS_AUDIT_ENABLED=true`; prefer over legacy `audit_log`                         |
| **Soft deletes**         | `deleted_at` / `deleted_by` when `SOFT_DELETES_ENABLED=true`; helpers in `@loftlancer/drizzle`          |
| **Feature flags**        | `packages/t3-env/src/utils/t3-env.feature-flags.ts` (paired server + `NEXT_PUBLIC_*` where required)    |

Org roles in product copy: **Owner / Manager / Member** (legacy DB `admin` → Manager). **Platform admin** (`platform.*`) is reserved, not enabled in production UI.

**Actions, audit, events:** [actions-and-events.md](./actions-and-events.md).

## Recipe: add or change a gated operation

1. **Issue** — Every change ties to a GitHub issue (`Fixes #N`).
2. **Registry** — Add or adjust a row in `authorization.registry-data.ts` (`name`, `scope`, `orgRoles`, grants, audit entity, optional `notifyOn`).
3. **API** — oRPC procedure + module controller using **`runAction`** / **`requireAction`** with registry ID ([actions-and-events.md](./actions-and-events.md)). Map to **ServiceResponse** ([data-workflow.md](./data-workflow.md)).
4. **UI** — Gate with same action name; intent tracking optional ([actions-and-events.md](./actions-and-events.md)).
5. **Audit** — Log **success, denied, and failure** for mutating actions when audit is enabled — not success-only.
6. **Tests** — Add or extend router/action tests for allow and deny cases you touched.
7. **MCP** (if exposed) — Register scope in MCP tooling; keep `mcp-exposed-actions` coverage in sync.
8. **Flags / schema** — If the action needs new columns or flags, ship **reviewed SQL** or `db:push` on dev first; see [database.md](./database.md). Enable flags only after migration (see `feature-flags.ts` `docPath`s).

## Recipe: inspect what exists (no markdown inventory)

```bash
rg 'name: "' features/authorization/src/constants/authorization.registry-data.ts   # canonical action ids

pnpm audit:api-entrypoints   # optional; set API_ENTRYPOINT_INVENTORY_OUT to write a file
```

Studio routes: read `apps/studio/src/app` and module folders — no route matrix in docs.

## Soft deletes (short)

When `SOFT_DELETES_ENABLED=true`, user-facing deletes set `deleted_at` / `deleted_by`. Queries and export paths must respect soft-delete filters (see `@loftlancer/drizzle` and router tests). Enable only after schema includes soft-delete columns — [database.md](./database.md).

## Related

- [actions-and-events.md](./actions-and-events.md) — action IDs, runAction, audit, events
- [index.md](./index.md) — doc map
- [integrations.md](./integrations.md) — third-party services
- [README.md](../README.md) — run locally, env vars
