# App Router page states (loading, error, not found, forbidden)

How **Next.js `app/`** handles route-level states without layout shift, and how that connects to **ServiceResponse** in modules ([data-workflow.md](./data-workflow.md), [modules.md](./modules.md), [rendering.md](./rendering.md)).

**Apps stay thin:** `loading.tsx` / `error.tsx` / `not-found.tsx` import from **`module/…/client`** or shared **`@loftlancer/ui`** patterns — no domain logic in `apps/`.

---

## Two layers of “state”

| Layer | Mechanism | When |
|-------|-----------|------|
| **Route / segment** | `loading.tsx`, `error.tsx`, `not-found.tsx`, `/forbidden`, redirects | Navigation, thrown errors, guards, missing resources |
| **In-page / island** | **ServiceResponse** + boundary ([data-workflow.md](./data-workflow.md)) | oRPC/action result: `success` \| `failed` \| `error` |

**Shell layout** (Tier 1: sidebar, inset, header) persists across modules; **section layout** (Tier 2: sub-header/tabs) persists across child pages — see [layouts.md](./layouts.md). Only the **page content** slot swaps for loading/content/error.

```text
(private)/(shell)/layout.tsx           ← Tier 1 → module/studio-shell
    ├── [org]/teams/[teamId]/layout.tsx ← Tier 2 → module/teams/…/layout
    ├── loading.tsx                    ← replaces page slot; match Tier 2 geometry
    ├── error.tsx
    ├── not-found.tsx
    └── …/page.tsx
```

---

## State → handler map

| User-visible state | Route-level (App Router) | In-page (ServiceResponse) | Layout behavior |
|--------------------|---------------------------|---------------------------|-----------------|
| **Loading (navigation)** | `loading.tsx` | Hook `isPending` (no response yet) | Skeleton **matches** final page geometry; optional delay ([DelayedPageLoading](#delayed-loading)) |
| **Success with data** | — | `status: success` + data | Main content |
| **Success, empty** | — | `status: success` + `null` / `[]` | Empty state ([data-workflow.md](./data-workflow.md)) |
| **Validation / business** | — | `status: failed` | Warning toast + inline message (not red system box) |
| **System fault** | `error.tsx` if uncaught throw | `status: error` | Red toast + error box; retry when appropriate |
| **Route forbidden** | `/forbidden` | — | Full-page deny |
| **Not found** | `notFound()` → `not-found.tsx` | — | Scoped 404 (#317) |
| **Slow load** | `DelayedPageLoading` timeout | map to `error` or route retry | “Taking too long” |

**Rule:** **`failed`** ≠ **`error`**. Empty list = **`success`**, not **`failed`**. Details: [data-workflow.md](./data-workflow.md).

---

## `loading.tsx` (segment transitions)

**Purpose:** Stream or suspend **child segment** while server page + module loaders run.

**Rules:**

1. Place at the **narrowest segment** that owns the slow fetch (`[org]/loading.tsx`, `[project]/loading.tsx`, …).
2. **Do not** re-skeleton the whole dashboard shell — only the main column (`children`).
3. Import skeleton from **`module/<feature>/client/…/skeletons/`** (same header rows, tabs, card grid as real page).
4. Wrap with **`DelayedPageLoading`** ([packages/ui](packages/ui)) so fast navigations (< ~300ms) show **nothing** instead of a flash, then skeleton, then timeout → error + retry.

```tsx
// apps/studio/…/[org]/loading.tsx — target shape (thin app file)
import { DelayedPageLoading } from "@loftlancer/ui/patterns/delayed-page-loading";
import { OrgRouteSkeleton } from "@module/organizations/client/studio/skeletons/client.org-route.skeleton";

export default function Loading() {
  return <DelayedPageLoading fallback={<OrgRouteSkeleton />} />;
}
```

**Layout shift:** skeleton and page share **`PageStack`**, **`PageHeader`** height, and content min-height.

---

## `error.tsx` (segment errors)

**Purpose:** Uncaught errors in **server components** or **client children** below the error boundary.

**Rules:**

1. **`"use client"`** (Next requirement) — keep file thin; use `@loftlancer/ui/patterns/page-state`.
2. **`reset()`** retries the segment render — use for transient/server faults.
3. Do **not** catch expected **forbidden/not-found** here — map those in guards to `notFound()` / `/forbidden` before throw.
4. Module-specific copy: optional **`module/…/client/…/components/client.<route>.error.tsx`** exported for app `error.tsx` to re-export.

**Layout shift:** error UI occupies the **same content slot** as loading/content (full width below header if page uses shared layout).

---

## `not-found.tsx`

**Purpose:** Invalid org/project slug, missing entity, bad deep link — **`notFound()`** from server page/guard.

**Rules:**

1. Resolve **scope** in a server function (`resolveNotFoundScope`) — never echo unknown slugs in titles (#317).
2. Keep **shell** when using nested `not-found.tsx` under `(shell)` so nav remains usable.
3. Logic migrates to **`module/…/server/page/`**; app file imports and renders module RSC.

**Not the same as `ViewState.empty`:** 404 = route/resource missing; empty = valid route, zero rows.

---

## Forbidden

**Purpose:** User is authenticated but **must not** see the page (`PageForbiddenError`, page guard, action denial on route).

**Today:** `redirect("/forbidden")` → `(shell)/forbidden/page.tsx` with `AppForbiddenPage`.

**Rules:**

1. Guards throw **`PageForbiddenError`**; **`runPageGuard`** / **`applyPageGuardError`** maps to redirect — not generic `error.tsx`.
2. In-page oRPC **403** → map hook to **`ViewState.failed`** or small inline forbidden block **inside** content — do not redirect for a single widget unless whole page is unusable.
3. Forbidden page uses same **frame width** as other auth states (`Auth5Frame`) to avoid jarring layout when redirecting.

---

## Layout vs `template.tsx`

| File | Re-renders on navigation? | Use for |
|------|---------------------------|---------|
| **`layout.tsx`** | No (persists) | Shell, sidebar, providers, org context |
| **`template.tsx`** | Yes (remount) | Rare: intentional enter/exit animation on segment change |
| **`loading.tsx`** | Shows during suspend | Segment skeleton only |

**Default:** no `template.tsx` unless you need animation — avoids extra remount flicker.

**PPR / streaming:** static shell from layout + server page streams; client islands hydrate with **`dynamic()`** skeletons ([rendering.md](./rendering.md)) so button slots do not collapse when loaded.

---

## Seamless transitions (checklist)

1. **One geometry** — route `loading.tsx` skeleton ≡ success page structure (module-owned).
2. **Delayed skeleton** — `DelayedPageLoading` on route loaders; island skeletons only in **`dynamic()`** slots.
3. **Stable shell** — `(shell)/layout.tsx` never replaced by `loading.tsx` at root incorrectly.
4. **State promotion** — recoverable in-page error stays in **boundary**; promote to **`error.tsx`** only on throw.
5. **Forbidden / 404 early** — guards in **`server/page`** before heavy fetch; avoids loading → error flash.
6. **Client refetch** — switching `success` → `loading` → `success` in **boundary** keeps header/tabs mounted; only inner list shows skeleton rows.
7. **No full-page spinner** for partial updates — match granularity of the thing loading (row skeleton vs page skeleton).

---

## Module responsibilities

| Artifact | Location |
|----------|----------|
| Route skeleton | `module/<feature>/client/…/skeletons/client.<segment>.skeleton.tsx` |
| Page loader + guard errors | `module/<feature>/server/page/…` |
| `ViewState` mapping | `module/<feature>/utils/state/` |
| Boundary / Empty / Error UI | `module/<feature>/client/…/components/client.*.boundary.tsx` |
| App `loading.tsx` / `error.tsx` | Re-export module or ui pattern (no logic) |

---

## Auth app

Same model under `apps/auth/src/app`: account settings segments get **`loading.tsx` / `error.tsx`**; forbidden and not-found aligned with auth shell.

---

## Related

- [rendering.md](./rendering.md) — dynamic islands, logic in functions  
- [server-api.md](./server-api.md) — guards and server loaders  
- [modules.md](./modules.md) — `ViewState` statuses  
- [product.md](./product.md) — page guards and actions  
