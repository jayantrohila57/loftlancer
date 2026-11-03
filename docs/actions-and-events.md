# Actions & events

Canonical **action IDs**, **permission wrapping**, **audit for every outcome**, and **product events** for analytics/errors (Sentry, PostHog). Works with [ServiceResponse](./data-workflow.md) and [product.md](./product.md).

**Registry (source of truth):** `features/authorization/src/constants/authorization.registry-data.ts` → `@features/authorization/utils` (deprecated shim: `@loftlancer/actions`)

**Cursor rule:** [.cursor/rules/actions-events.mdc](../.cursor/rules/actions-events.mdc)

---

## Action ID (one name, many uses)

Every gated or auditable operation uses a **single string ID** from the registry (e.g. `team.create`, `member.invite`).

| Consumer          | Use                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------- |
| **RBAC / ABAC**   | `requireAction` → `evaluatePermission` — see [access-control.md](./access-control.md) |
| **UI**            | `<Can action="…">`, `useCan("…")`, hide/disable controls                              |
| **Audit**         | `audit_event.action` + `result`                                                       |
| **Notifications** | `notifyOn` on registry row → fired on **audit success**                               |
| **Tracking**      | Breadcrumb/span attribute `loftlancer.action` on client + server                      |

**Rule:** No ad hoc action strings — add a registry row first ([product.md](./product.md)).

---

## Action vs event

|                | **Action**                                                     | **Event**                                                                       |
| -------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| **Purpose**    | Authorized **mutation or gated read** with audit               | **Signal** for lifecycle, analytics, diagnostics                                |
| **ID**         | Registry **action name** (required)                            | Event name (often `actionId` + phase, or dedicated `*.attempt` / `*.completed`) |
| **Permission** | **Yes** — wrapper checks RBAC                                  | Usually **no** extra gate (audit may still record)                              |
| **Audit**      | **Always** log attempt outcome when auditing is on (see below) | Log when tied to an action or product-analytics policy                          |
| **When**       | Server entry (controller)                                      | **Before** or **after** work — see [Event phases](#event-phases)                |

---

## Audit: success, failed, and error (all logged)

When audit is enabled for a **mutation** (not passive reads — see `isReadAction` in `requireAction`):

| Outcome                              | `audit_event.result`                                  | ServiceResponse `status` | Typical case                |
| ------------------------------------ | ----------------------------------------------------- | ------------------------ | --------------------------- |
| Allowed + work OK                    | **`success`**                                         | **`success`**            | Create team saved           |
| Denied (RBAC, archived org, blocked) | **`denied`**                                          | **`failed`**             | User lacks role             |
| Expected business/validation reject  | **`failure`**                                         | **`failed`**             | Duplicate name              |
| System fault                         | **`failure`** or dedicated row + **`error`** response | **`error`**              | DB down, uncaught exception |

**Target policy (new code):** every **mutating** controller runs through **`runAction`** so **permission check + handler + audit** share one path; **do not skip audit** on deny or validation failure when `audit !== false`.

Existing: `writeAuditEvent` in `packages/orpc/src/actions/audit-event-writer.ts`; `requireAction` already writes **success | denied | failure** with duration.

---

## `runAction` wrapper (server — target)

**Location (target):** `module/shared/server/run-action.ts` (or thin re-export from `@loftlancer/orpc` calling module-friendly API).

**Responsibilities:**

1. Accept **`actionId`** (`ActionName`) + context (user, org, project, team, IP, UA).
2. **`requireAction`** (or evaluate + audit deny).
3. Run **service** handler.
4. Map outcome → **ServiceResponse** + **`writeAuditEvent`** for **every** terminal state (success, denied, failure).
5. Attach **`actionId`** to thrown/logged errors for Sentry.

```text
runAction({ action: "team.create", ctx, handler })
  → requireAction / deny → audit denied
  → handler() → success → audit success → ServiceResponse success
  → validation → audit failure → ServiceResponse failed
  → throw/catch system → audit failure → ServiceResponse error
```

Controllers stay thin: **`return runAction(...)`** instead of calling `requireAction` and service separately without audit on failure.

**oRPC / MCP / Server Actions / routes:** same wrapper inside **module controller**.

---

## UI permission wrapper (client)

**Purpose:** Same **action ID** as server; never imply permission without registry.

| Pattern                                    | Use                                                                |
| ------------------------------------------ | ------------------------------------------------------------------ |
| `<Can action="team.create">`               | Hide or disable children                                           |
| `useCan("team.create")`                    | Enable button, menu item                                           |
| **`trackActionIntent(actionId)`** (target) | Before click: PostHog/Sentry breadcrumb “user clicked Create team” |

**Rule:** If the button is visible and enabled, server **still** enforces — UI gate is UX only.

Optional **`ActionButton`** wrapper (target in `module/shared/client` or `@loftlancer/ui`): props `action`, `onPerform`, handles `useCan` + intent event + calls hook that invokes oRPC.

---

## Event phases

**Event functions** live in **`module/<feature>/server/events/`** or **`module/shared/server/events/`** — pure **callables**, not React.

| Phase        | When to call                                  | Example                                                                         |
| ------------ | --------------------------------------------- | ------------------------------------------------------------------------------- |
| **`before`** | Start of controller / user intent confirmed   | `emitActionEvent({ action: "team.create", phase: "before", ctx })`              |
| **`after`**  | Handler finished (map ServiceResponse status) | `emitActionEvent({ phase: "after", result: "success" \| "failed" \| "error" })` |

**Responsibilities:**

- Stable **event name** + **action ID** on payload for PostHog / Sentry / logs.
- Optional extra audit row for analytics-only events (policy TBD per event).
- **No business rules** — delegate rules to service; events observe.

**Client crash after click, API never returns:** **`before`** / intent breadcrumb already captured action ID; Sentry ties UI to action.

```text
User click → trackActionIntent("team.create")     [client]
          → oRPC → runAction before event           [server]
          → service …
          → runAction after event + audit           [server]
          → ServiceResponse → toast + UI            [client]
```

---

## Mapping to [data-workflow.md](./data-workflow.md)

| ServiceResponse | Toast  | Audit (mutation)           | Event `after`     |
| --------------- | ------ | -------------------------- | ----------------- |
| `success`       | Green  | `success`                  | `result: success` |
| `failed`        | Yellow | `denied` or `failure`      | `result: failed`  |
| `error`         | Red    | `failure` (+ error detail) | `result: error`   |

---

## File layout (target)

```text
features/authorization/src/constants/authorization.registry-data.ts  # IDs, roles, audit entity, notifyOn

module/shared/server/
├── run-action.ts                         # permission + handler + audit + ServiceResponse
└── events/emit-action-event.ts

module/<feature>/server/
├── controller/…                          # uses runAction
└── events/…                                # module-specific event helpers (optional)

module/<feature>/client/
└── hooks/…                               # oRPC + toast; optional trackActionIntent
```

---

## Checklist (new mutating operation)

- [ ] Row in **`registry-data.ts`** (`name`, scope, roles, `entityType`, `notifyOn` if needed).
- [ ] Server: **`runAction`** with that **`actionId`**; audit on all outcomes.
- [ ] UI: **`useCan` / `<Can>`** with same ID.
- [ ] **`before`/`after` events** if analytics/debugging required.
- [ ] ServiceResponse from controller; tests for allow, deny, validation ([product.md](./product.md)).
- [ ] MCP exposure updated if applicable.

---

## Related

- [access-control.md](./access-control.md) — RBAC vs ABAC in Loftlancer
- [product.md](./product.md) — registry recipe
- [data-workflow.md](./data-workflow.md) — ServiceResponse + UI
- [server-api.md](./server-api.md) — controllers
- [integrations.md](./integrations.md) — Sentry, etc.
