# Gap: server folder responsibilities

**Purpose:** Without a decision table, agents add loaders in three places, duplicate download logic, or put business rules in controllers.

See: [modules.md](../modules.md), [server-api.md](../server-api.md).

---

## Decision table

| Need | File location | Name pattern |
|------|---------------|--------------|
| DB + business rules | `module/<feature>/server/service/` | `server.<operation>.service.ts` |
| Map to ServiceResponse + `runAction` | `module/<feature>/server/controller/` | `server.<operation>.controller.ts` |
| RSC initial page data | `module/<feature>/server/page/` | `server.<screen>.page.ts` |
| Next `route.ts` entry (streams, webhooks) | `module/<feature>/server/handlers/` | `server.<name>.handler.ts` |
| Server Action export | `module/<feature>/server/actions/` | `server.<name>.action.ts` |

---

## Controller vs service

| Layer | Must | Must not |
|-------|------|----------|
| **Service** | ORM, domain rules, return `ServiceOutcome` | HTTP, toast, React, audit writes |
| **Controller** | Parse input (Zod), `runAction`, map outcome → ServiceResponse + schema parse | Business rules, direct UI concerns |

**One operation** = one service function + one controller function (same basename).

---

## RSC page loaders

**Rule:** Initial server data for a screen lives in **`server/page/`** only.

- **`client/.../loaders`** — do **not** add new server fetch loaders; use `server/page` + pass props.
- App `page.tsx` imports **`loadX`** from `@module/.../server/page/...` or re-exports module RSC page component.

---

## Handlers vs controller

HTTP routes (non-oRPC) use **`server/handlers/`** that:

1. Validate request / auth context  
2. Call the **same controller** as oRPC would use  

**Forbidden:** duplicate download/query logic only in handler without a shared controller.

---

## Server Actions

| File | Content |
|------|---------|
| `module/.../server/actions/server.foo.action.ts` | `"use server"` function → controller |
| `apps/.../actions.ts` | **Re-export only** — one line per action |

**Default transport:** oRPC. Server Actions **only** when:

- Progressive enhancement for forms without client JS, or  
- Listed platform exceptions (file upload shape, etc.)

---

## Shared cross-feature

Use **`module/shared/server`** only when **two or more** domains need the same server helper. Otherwise keep code in the owning feature module.

---

## Related

- [orpc-transport.md](./orpc-transport.md) — procedures call controllers  
- [contracts.md](./contracts.md) — ServiceOutcome → ServiceResponse  
