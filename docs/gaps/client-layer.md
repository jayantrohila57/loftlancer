# Gap: client layer

**Purpose:** Agents inline status switches, import client leaves statically, duplicate toast logic, or reintroduce a parallel **`ViewState`** enum.

See: [rendering.md](../rendering.md), [data-workflow.md](../data-workflow.md), [app-states.md](../app-states.md).

---

## Source of truth for UI state

| UI state                  | Source                                                                         |
| ------------------------- | ------------------------------------------------------------------------------ |
| **Loading**               | Route `loading.tsx` or hook **`isPending`** — no ServiceResponse yet           |
| **Success content**       | `status === "success"` and data present                                        |
| **Empty**                 | `status === "success"` and (`data === null` or `data.length === 0` for arrays) |
| **Validation / business** | `status === "failed"`                                                          |
| **System fault**          | `status === "error"`                                                           |

**Do not** add a separate **`ViewState`** enum that duplicates `ServiceResponse.status`. Optional **`utils.response-to-ui.mapper.ts`** derives display props from response + `isPending` only.

---

## Hook naming

| Pattern | Example                                                       |
| ------- | ------------------------------------------------------------- |
| File    | `client/hooks/client.use-<domain>-<operation>.hook.ts`        |
| Export  | `useTeamGet`, `useTeamCreate` (see [naming.md](../naming.md)) |

**Mutation hooks must:**

1. Call oRPC via `@/lib/orpc`
2. Call **`applyResponseToast(response, toastAdapter)`** unless `{ skipToast: true }`
3. Return **`ServiceResponse`** (or typed data + response) to boundary
   **Query hooks must:**

- Use query keys from **`module/<feature>/utils/constants/query-keys.ts`**
- Accept **`initialData`** from server page only (avoid double fetch)

---

## Boundary + content

| Component                      | Role                                                        |
| ------------------------------ | ----------------------------------------------------------- |
| `client.<screen>.boundary.tsx` | Switch on `isPending`, then `status`, empty check on `data` |
| `client.<screen>.content.tsx`  | Props only — assumes success + data (called from boundary)  |

**Forbidden:** fetch, permission checks, or toast inside **content** components.

---

## Dynamic client islands

Every **`"use client"`** leaf imported from a server component tree:

```tsx
const TeamMembersPanel = dynamic(
  () => import("./client.members.panel").then((m) => m.TeamMembersPanel),
  { loading: () => <TeamMembersPanelSkeleton /> },
);
```

Skeleton must match final layout ([app-states.md](../app-states.md)). Exceptions must be listed in the feature module README — default is **no exceptions**.

---

## Toast colors

| `status`  | Toast variant                                                  |
| --------- | -------------------------------------------------------------- |
| `success` | Success (green)                                                |
| `failed`  | Warning (yellow) — show field errors from `error` when present |
| `error`   | Error (red) — generic safe `message`                           |

Use **`applyResponseToast`** — see `module/shared/client/apply-response-toast.ts`.

---

## Permission UI

- **`useCan(actionId)`** / **`<Can action={}>`** only — same ID as [registry](../product.md).
- **`trackActionIntent(actionId)`** before mutation click (unless `meta.silent`).

Optional shared **`ActionButton`** in `module/shared/client` when wired — props: `action`, `onPerform`.

---

## Related

- [imports-paths.md](./imports-paths.md)
- [layouts-routes.md](./layouts-routes.md) — Tier 2 section layout
