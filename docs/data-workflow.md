# Data workflow (service → response → UI)

**One contract** for every server operation and every client consumer: oRPC, Server Actions, Next route handlers, MCP, and RSC loaders.

Related: [modules.md](./modules.md), [server-api.md](./server-api.md), [rendering.md](./rendering.md), [app-states.md](./app-states.md).

**Cursor rule:** [.cursor/rules/data-workflow.mdc](../.cursor/rules/data-workflow.mdc)

---

## Pipeline

```text
Service (ORM / business)     → internal result
Controller                   → map to ServiceResponse + Zod parse
Transport (oRPC / action / route / MCP)   → JSON body (same shape)
Client hook / server page    → toast (mutations/refetch) + props to UI
Component                    → render from status + data only (no logic)
```

**All domain logic stays in `module/<feature>/server/service`.** Controllers in `server/controller` normalize **status, data, message, error**. Never return ad hoc `{ items }` or throw to the client for expected validation failures.

---

## Service result (three statuses)

Every service operation **must** resolve to one of:

| `status`      | Meaning                                                                  | Examples                                                                   |
| ------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| **`success`** | Operation completed                                                      | Row(s) returned, mutation applied                                          |
| **`failed`**  | Expected rejection — **logic / validation / permission / business rule** | Invalid input after Zod at service edge, “name already taken”, not allowed |
| **`error`**   | **System** failure — unexpected                                          | DB unreachable, bug, unhandled exception, upstream 5xx                     |

**Do not** use `error` for validation the user can fix — that is **`failed`**.

**Loading** is **not** part of this contract — it is UI/route (`loading.tsx`, query `isPending`) before a response exists.

---

## ServiceResponse (canonical JSON)

Shared schema lives in **`module/shared/utils/`** (validated on every controller exit and optionally on client parse). Exact types and factories: [gaps/contracts.md](./gaps/contracts.md).

```ts
{
  status: "success" | "failed" | "error",
  data: T | T[] | null,
  message: string,   // human-readable; required for every status
  error?: unknown    // structured detail when status === "error"; optional detail for failed
}
```

### Rules

| Field         | Rule                                                                                                                                                                                    |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`status`**  | Exactly one of `success` \| `failed` \| `error`.                                                                                                                                        |
| **`data`**    | **`success`:** payload or `null` if none. **`failed` / `error`:** `null` (or `[]` for list ops if you standardize lists — pick one per module; shared schema documents default `null`). |
| **`message`** | Always set — success copy (“Team updated”), failed copy (“Name is required”), error copy (“Something went wrong”).                                                                      |
| **`error`**   | **`error` status:** required detail (code, cause safe for logs). **`failed`:** optional field-level map for forms. **`success`:** omit or `null`.                                       |

Controllers **`serviceResponseSchema.parse(...)`** (or `.safeParse` → map parse failure to `error`) before returning to oRPC/actions/routes.

List operations: on **`success`** with zero rows, use **`status: "success"`**, **`data: []`**, **`message`** e.g. “No teams yet” — UI shows **empty state**, not `failed`.

---

## Layer responsibilities

| Layer             | File area                                                         | Job                                                                                                     |
| ----------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Service**       | `module/…/server/service/*.service.ts`                            | DB/ORM, `requireAction`, return internal `{ ok, data }` or `{ failed, message }` or catch → `{ error }` |
| **Controller**    | `module/…/server/controller/*.ts`                                 | Map service → **ServiceResponse**, run **response schema**, no UI                                       |
| **Transport**     | `@loftlancer/orpc` oRPC, MCP, `route.ts`, Server Action re-export | Auth/middleware; return controller result unchanged                                                     |
| **Hook / loader** | `module/…/client/hooks`, `server/page`                            | Call transport or controller; **toast** on mutation/refetch; pass **`response`** to components          |
| **Component**     | `module/…/client/components`                                      | Render from **`status` + `data` + `message`** only                                                      |

---

## Frontend: two outputs from one response

After collecting **ServiceResponse** (oRPC result, action return, or server-passed props):

### 1. Toast (mutations, refetch, explicit user actions)

| `status`      | Toast                                                                   |
| ------------- | ----------------------------------------------------------------------- |
| **`success`** | Green — `message`                                                       |
| **`failed`**  | Warning (yellow) — `message`; show field errors from `error` if present |
| **`error`**   | Red — `message` (generic safe text; log `error` server-side)            |

Skip toast for silent background prefetch unless product asks otherwise (`meta.skipToast` pattern in hooks).

### 2. Component body (always)

| Condition                               | UI                                                                                                    |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **`success`** + data present            | Main **content**                                                                                      |
| **`success`** + no data (`null` / `[]`) | **Empty state** (use `message` as description when helpful)                                           |
| **`failed`**                            | **Validation / business message** — inline or form errors from `error`; not the red system ErrorState |
| **`error`**                             | **Error box** — retry when appropriate; distinct from `failed`                                        |

Route-level **not-found / forbidden** stay in App Router ([app-states.md](./app-states.md)); in-page API **`failed`** for 403-style deny, **`error`** for system faults.

**Boundary pattern:** `client.*.boundary.tsx` switches on `status` (+ empty check on `data`); **content** component assumes success + data.

---

## UI `loading`

While no **ServiceResponse** yet:

- Route: `loading.tsx` + skeleton ([app-states.md](./app-states.md)).
- Client: hook exposes `isPending` → skeleton in boundary **without** faking a `status`.

Do not add `status: "loading"` to ServiceResponse.

---

## Where files live

```text
module/shared/utils/
├── validation/utils.service-response.validation.ts   # Zod + createSuccess/createFailed/createError helpers
├── types/utils.service-response.types.ts             # ServiceResponse<T>, status union
└── state/utils.response-to-ui.mapper.ts              # map response → boundary props

module/<feature>/server/service/…          # ORM + business → internal result
module/<feature>/server/controller/…       # → ServiceResponse + parse
module/<feature>/client/hooks/…            # oRPC + toast + pass response
module/<feature>/client/components/…      # boundary + content
```

---

## Transport parity

| Entry                    | Must return                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------ |
| oRPC procedure           | `ServiceResponse<T>`                                                                 |
| Server Action            | same                                                                                 |
| Next `route.ts` JSON     | same (or HTTP status + body with same shape)                                         |
| MCP tool result          | map to same fields for agent consumers                                               |
| RSC loader (server-only) | pass `ServiceResponse` or unwrapped `data` + `status` props to page — same semantics |

No parallel `{ team: … }` or raw throws for expected failures in new code.

---

## Checklist (new operation)

- [ ] Service returns success \| failed \| error internally.
- [ ] Controller maps to **ServiceResponse** and **validates schema**.
- [ ] Message written for every status; validation → **failed**, system → **error**.
- [ ] Hook: toast on mutation/refetch per color rules.
- [ ] Component: empty on success + no data; failed vs error UI distinct.
- [ ] [CHANGELOG.md](../CHANGELOG.md) when merged to `dev`.

---

## Related

- [modules.md](./modules.md) — `utils/state`, hooks, boundaries
- [rendering.md](./rendering.md) — logic in functions, components render props
- [product.md](./product.md) — permissions (often **`failed`**, not `error`)
