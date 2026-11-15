# Modules — UI tree (server-first)

**Prev:** [domain-architecture.md](./domain-architecture.md)

## Layering (top → bottom)

1. **Route layout / page (server)** — composes frame; no domain API for children.
2. **Organisms (server when possible)** — group regions; **not** responsible for child fetch/state.
3. **Molecules / atoms** — **one job**: one API or one state machine; own **loading, empty, error, success** UI to avoid layout shift.
4. **Client leaves** — `"use client"` only where needed; **dynamic import** + **skeleton** at boundaries.

## Data ownership

- **Do not** fetch session (or similar) in root app layout and prop-drill to header → user menu.
- Each piece (nav by role, user avatar, search) **calls its own API**; cache with React Query on client, server fetch on server components.

## Cache Components (Next.js 16 PPR)

With `cacheComponents: true` (see [../apps/cache-components.md](../apps/cache-components.md)):

| Data                           | Pattern                                                                   |
| ------------------------------ | ------------------------------------------------------------------------- |
| Shared / same for many users   | `'use cache'` in module **service** or server slice; `cacheTag` on mutate |
| Per-request (session, cookies) | Async server child inside **`<Suspense>`** + skeleton                     |
| Client interactivity           | React Query in **`modules/<slug>/hooks/`** at leaves                      |

Module pages exported to apps should compose **cached shell + Suspense holes + client leaves** — not one blocking server tree.

## Client boundaries

- Prefer **server** wrapper + small **client** child (e.g. card body server, submit button client).
- A client leaf **MUST** be self-contained so it does not force parents to become client.

```tsx
// pattern: server collects props, client leaf submits
;<Card>
  <CardTitle>{title}</CardTitle>
  <UserSubmitActions userId={id} />
</Card>
```

## Dynamic import

Client components **SHOULD** load with `next/dynamic`, **`ssr: false`**, and a **skeleton** whose size matches live UI (shared layout tokens).

**Normative detail:** [organism-components.md](./organism-components.md) (no prop drilling, Coss UI, toasts, module tsconfig).

## Context

Use **context** only when multiple leaves must share state; default to colocated fetch + query cache.

## Features vs module

Build organisms from **`@features/*`** (generic table, form, RBAC) — module adds **domain** wiring and validation.

**Next:** [api-structure.md](./api-structure.md)
