# Gap: actions, audit, and events

**Purpose:** Agents skip audit on deny, throw `FORBIDDEN` to the client, or invent event names unrelated to registry action IDs.

See: [actions-and-events.md](../actions-and-events.md), [access-control.md](../access-control.md).

---

## runAction (required for mutations)

**Location:** `module/shared/server/run-action.ts`

**Signature (contract):**

```ts
runAction<T>(input: {
  action: ActionName;
  ctx: RunActionContext;
  audit?: boolean; // default true for mutations; false only when registry marks read/skip
  handler: () => Promise<ServiceOutcome<T>>;
}): Promise<ServiceResponse<T>>;
```

**Steps (fixed order):**

1. `buildAccessContext(ctx)` — fields required per `action.scope` (org, project, team, user)
2. **`requireAction`** — on deny → audit **`denied`** → return **`createFailed(message)`** (no throw to client)
3. Optional **`emitActionEvent({ phase: "before", ... })`**
4. Run **handler** (service work)
5. Map **`ServiceOutcome`** → ServiceResponse
6. **`writeAuditEvent`** for **success | denied | failure** on every terminal mutation outcome
7. Optional **`emitActionEvent({ phase: "after", serviceResponse })`**

Controllers: **`return runAction(...)`** — do not call `requireAction` and service separately without audit on failure.

---

## Reads vs mutations audit

| Kind                                         | Audit                                     |
| -------------------------------------------- | ----------------------------------------- |
| **Read** actions (`isReadAction` / registry) | **No audit** unless `alwaysAudit`         |
| **Mutations**                                | **Always** audit success, denied, failure |

---

## Permission deny mapping

| Wrong                                   | Right                                                          |
| --------------------------------------- | -------------------------------------------------------------- |
| Throw TRPC/oRPC error for expected deny | **`ServiceResponse` with `status: "failed"`** + audit `denied` |
| Skip audit on validation failure        | Audit **`failure`** + `failed` response                        |

---

## emitActionEvent

**Location:** `module/shared/server/events/emit-action-event.ts`

```ts
emitActionEvent(input: {
  action: ActionName;
  phase: "before" | "after";
  ctx: RunActionContext;
  serviceResponse?: ServiceResponse<unknown>;
}): void;
```

- **Event name** derives from **`action` ID** — no duplicate custom event IDs unless listed in [actions-and-events.md](../actions-and-events.md).
- **No business rules** in event helpers — observe only.

---

## Client intent

**`trackActionIntent(actionId)`** in `module/shared/client/track-action-intent.ts` — call before mutation click (PostHog/Sentry breadcrumb). Server still enforces permissions.

---

## ABAC context

`RunActionContext` must supply what **`evaluatePermission`** needs (project grants, team link, org role, etc.). Document per-scope requirements in [access-control.md](../access-control.md); **`runAction`** must not call handlers without built context for gated actions.

---

## ServiceResponse ↔ audit ↔ event

| ServiceResponse | Audit (mutation)      | Event `after`     |
| --------------- | --------------------- | ----------------- |
| `success`       | `success`             | `result: success` |
| `failed`        | `denied` or `failure` | `result: failed`  |
| `error`         | `failure` (+ detail)  | `result: error`   |

---

## Related

- [contracts.md](./contracts.md)
- [orpc-transport.md](./orpc-transport.md) — same wrapper in all transports
