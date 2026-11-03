# Access control: RBAC + ABAC

Loftlancer uses **one action ID** ([actions-and-events.md](./actions-and-events.md)) with **two layers**:

1. **RBAC** — who you are (org/team/platform **role** from registry).
2. **ABAC** — whether this **request context** satisfies **attributes** (project assignment, grants, team link, flags, resource state).

Both run inside **`requireAction` → `evaluatePermission`** before service logic. Deny → audit **`denied`** + ServiceResponse **`failed`**.

Registry: `features/authorization/src/constants/authorization.registry-data.ts` · Evaluator: `features/authorization/src/utils/authorization.evaluate.ts` · Loader: `@features/authorization/core/server/authorization.require-action.ts` (re-export: `packages/orpc/src/actions/require-action.ts`)

---

## RBAC (role-based)

**Question:** “Is this **role** allowed to attempt this action at all?”

| Input         | Source                                               |
| ------------- | ---------------------------------------------------- |
| **Org role**  | `owner` \| `manager` \| `member` on `member.role`    |
| **Team role** | `lead` \| `member` when action has `teamRoles`       |
| **Platform**  | Platform admin flag (bypass org checks when enabled) |
| **Registry**  | `orgRoles`, `teamRoles`, `scope` per action row      |

Examples:

- `team.create` — registry says which org roles may try it.
- Owner often **allows all** org-scoped actions without extra attributes.

**UI “RBAC”:** `useCan` / `<Can>` use snapshots from **`evaluatePermission`** with **partial** context (org role only) — may show **“grant”** (needs project/team) vs **yes/no** via `roleCapability` in `authorization.evaluate.ts`.

RBAC alone is **not** enough for project-scoped or grant-gated actions.

---

## ABAC (attribute-based)

**Question:** “Given **this user + this org + this project/team + this resource**, is the action allowed **now**?”

Attributes passed into **`evaluatePermission`** (and extra checks in **`requireAction`**):

### Evaluator attributes (`EvaluatePermissionInput`)

| Attribute                        | Meaning                                                                                         |
| -------------------------------- | ----------------------------------------------------------------------------------------------- |
| **`project.isProjectCreator`**   | User created the project                                                                        |
| **`project.isProjectManager`**   | Manager assignment on project                                                                   |
| **`project.hasTeamLink`**        | Member access via team ↔ project link                                                           |
| **`project.memberGrants`**       | Grant keys (e.g. `project.permission.grant`) for members                                        |
| **`team.belongsToOrganization`** | Team in active org                                                                              |
| **`team.role`**                  | Team lead/member for `teamRoles` on action                                                      |
| **`customOrganizationActions`**  | Delegated org-scope actions (product currently returns **none** — hook for future custom roles) |

Registry flags that turn on ABAC:

- **`requiresProjectGrant`** — manager must be assigned to project (not org-wide manager bypass).
- **`projectGrantKey`** — which grant string members need in `memberGrants`.
- **`selfOnly`** (user scope) — target user must be actor.

### Environmental / resource checks (`requireAction` — not in `evaluatePermission`)

| Attribute / state                | Effect                                         |
| -------------------------------- | ---------------------------------------------- |
| **Organization archived**        | Deny mutations except restore/unarchive/delete |
| **Project/team org mismatch**    | Deny / NOT_FOUND                               |
| **App not installed** on project | Deny when action maps to project app           |
| **`isActionBlocked`**            | Per-user/org/project blocks                    |
| **Membership active**            | Must be org member (soft-delete aware)         |

These are **ABAC**: decisions depend on **resource and environment**, not role alone.

---

## How they combine (decision flow)

```text
runAction / requireAction(actionId, ctx)
  │
  ├─ ABAC: blocked? archived org? app installed? entity belongs to org?
  │
  ├─ RBAC: platform admin? user scope? org role in def.orgRoles?
  │
  ├─ ABAC + RBAC: evaluatePermission({
  │       action, orgRole,
  │       project: { isProjectManager, memberGrants, hasTeamLink, … },
  │       team: { role, belongsToOrganization },
  │       customOrganizationActions,
  │     })
  │
  └─ allow → service  |  deny → audit denied + failed response
```

**Same action ID** for audit, notifications, UI, and tracking — RBAC/ABAC only change **why** allow/deny.

---

## “Grant” in the UI (RBAC label, ABAC enforcement)

`roleCapability()` returns:

| Value       | Meaning                                                                                   |
| ----------- | ----------------------------------------------------------------------------------------- |
| **`yes`**   | Org role + `evaluatePermission` passes **without** project context                        |
| **`grant`** | Role may perform **only if** ABAC attributes satisfied (assignment, team link, grant key) |
| **`no`**    | Role cannot perform                                                                       |

Studio copy: **Owner / Manager / Member** + “grant” paths for project/team — RBAC matrix in registry, ABAC at runtime.

---

## Where to implement new rules

| Change                                      | Where                                                                                                     |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| New action ID, which roles may try          | **`registry-data.ts`** (RBAC matrix)                                                                      |
| New attribute (e.g. env lock, billing tier) | **`evaluatePermission`** and/or **`requireAction`**, plus pass context from **module service/controller** |
| Module-specific rule (e.g. sole owner)      | **Module service** after `requireAction`, or extend shared evaluator if cross-cutting                     |

Prefer **registry + evaluator** for reusable ABAC; one-off business rules in **service** still use **`failed`** (not **`error`**) when expected.

---

## Not separate “ABAC actions”

There is **no second ID system** for ABAC. One **`team.update`** action:

- **RBAC:** member cannot attempt (registry).
- **ABAC:** manager must be **`isProjectManager`** or member needs **`memberGrants`** + **`hasTeamLink`**.

---

## Related

- [actions-and-events.md](./actions-and-events.md) — `runAction`, audit, events
- [product.md](./product.md) — registry recipe
- [data-workflow.md](./data-workflow.md) — deny → `failed`
