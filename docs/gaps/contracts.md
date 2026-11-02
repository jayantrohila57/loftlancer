# Gap: canonical contracts

**Purpose:** One JSON and TypeScript shape for every server exit and client consumer. Without this doc + `module/shared/utils`, agents invent parallel shapes (`{ ok, team }`, throws for validation, etc.).

**Code:** [module/shared/utils/types/utils.service-response.types.ts](../../module/shared/utils/types/utils.service-response.types.ts), [module/shared/utils/validation/utils.service-response.validation.ts](../../module/shared/utils/validation/utils.service-response.validation.ts), [module/shared/utils/types/utils.service-outcome.types.ts](../../module/shared/utils/types/utils.service-outcome.types.ts).

---

## ServiceResponse (transport JSON)

Every oRPC procedure, Server Action, route handler JSON body, MCP tool result, and controller return uses **exactly**:

| Field | Type | Rule |
|-------|------|------|
| `status` | `"success" \| "failed" \| "error"` | Exactly one |
| `data` | `T \| T[] \| null` | See list rules below |
| `message` | `string` | Required for every status (human-readable) |
| `error` | `ServiceFieldErrors \| ServiceErrorDetail \| null \| undefined` | See below |

### List operations

| Case | Rule |
|------|------|
| Success, zero rows | **`status: "success"`**, **`data: []`**, message e.g. “No teams yet” → UI **empty state** |
| Success, rows | **`data: T[]`** |
| Failed / error | **`data: null`** (not `[]`) |

### Single-object operations

| Case | Rule |
|------|------|
| Success with payload | **`data: T`** |
| Success with no payload | **`data: null`** |
| Failed / error | **`data: null`** |

---

## `error` field by status

| `status` | `error` |
|----------|---------|
| **`success`** | Omit or `null` |
| **`failed`** | Optional **`ServiceFieldErrors`** for forms (field-level map) |
| **`error`** | **Required **`ServiceErrorDetail`** (code + safe message; optional `cause` for logs) |

### ServiceFieldErrors (validation / business)

```ts
type ServiceFieldErrors = Record<string, string | string[]>
```

Use keys matching form field names. Top-level `message` still required (summary for toast).

### ServiceErrorDetail (system)

```ts
type ServiceErrorDetail = {
  code: string
  message?: string
  cause?: unknown
}
```

Never expose stack traces or secrets in `message` on the wire.

---

## Factory helpers (must use)

Do not construct raw objects without Zod parse at controller boundary.

| Helper | Use |
|--------|-----|
| `createSuccess(data, message)` | Completed operation |
| `createFailed(message, error?)` | Validation, business rule, expected permission deny |
| `createError(message, error)` | System / unexpected failure |

Controllers call **`serviceResponseSchema.parse(...)`** (or `.safeParse` → map to `createError`) before return.

---

## Service layer (internal — not sent to client)

Services return **`ServiceOutcome<T>`** (see `utils.service-outcome.types.ts`):

| Outcome | Maps to ServiceResponse |
|---------|-------------------------|
| `{ kind: "success", data, message? }` | `createSuccess` |
| `{ kind: "failed", message, fieldErrors? }` | `createFailed` |
| `{ kind: "error", message, detail }` | `createError` |

**Rules:**

- Services **must not** return bare DTOs to transport.
- Expected validation / business rejection → **`failed`** outcome, not throw.
- Throw only for truly exceptional paths; controller **catch** → **`error`** ServiceResponse.

Controllers map outcome → factories → schema parse. **No UI** in controller.

---

## Forbidden

- `status: "loading"` on ServiceResponse (use route `loading.tsx` / hook `isPending`)
- Using **`error`** status for fixable validation
- Different field names (`ok`, `result`, `items` only) on product APIs
- Returning **`failed`** for empty lists (use success + `[]`)

---

## Related

- [data-workflow.md](../data-workflow.md) — pipeline and UI mapping  
- [client-layer.md](./client-layer.md) — boundaries and toast  
- [actions-audit.md](./actions-audit.md) — deny → `failed`, not throw  
