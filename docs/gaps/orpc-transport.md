# Gap: oRPC transport

**Purpose:** New endpoints must not add tRPC, fat handlers in `apps/`, or domain logic in `packages/orpc`. This doc fixes **where** procedures live and **how** they call modules.

See also: [server-api.md](../server-api.md), [packages.md](../packages.md).

---

## Layer responsibilities

| Layer           | Path                                                 | Allowed                                          |
| --------------- | ---------------------------------------------------- | ------------------------------------------------ |
| Domain          | `module/<feature>/server/controller`, `service`      | All business logic, `runAction`, ServiceResponse |
| Transport shell | `packages/orpc/src/orpc/`                            | Context, procedure registration, call controller |
| HTTP mount      | `apps/*/src/app/api/orpc/`                           | Catch-all handler only — **no procedures**       |
| Client          | `apps/*/src/lib/orpc.ts` + `module/.../client/hooks` | Typed client; hooks call oRPC                    |

**New code:** oRPC only. **Do not** add tRPC procedures.

---

## Procedure file layout

Add procedures under **`packages/orpc/src/orpc/procedures/<domain>.ts`** (create folder when greenfield wiring starts).

**Template:**

```ts
// packages/orpc/src/orpc/procedures/teams.ts — pattern only
import { teamGetController } from "@module/teams/server/controller/server.team-get.controller";
import { teamGetInputSchema } from "@module/teams/utils/validation/utils.team-get.validation";

export const teamGet = protectedProcedure
  .input(teamGetInputSchema)
  .handler(async ({ input, context }) => {
    return teamGetController({ input, ctx: context });
  });
```

**Rules:**

- Input schema from **`@module/<feature>/utils/validation`** only.
- Handler body = **one controller call** — no DB, no `requireAction` duplicate (controller or `runAction` owns it).
- Group exports by domain; merge in `studio-router.ts` / `account-router.ts`.

---

## Router assembly

| Router                  | File                                       | Mount                  |
| ----------------------- | ------------------------------------------ | ---------------------- |
| Studio product          | `packages/orpc/src/orpc/studio-router.ts`  | Studio app `/api/orpc` |
| Account / auth settings | `packages/orpc/src/orpc/account-router.ts` | Auth app `/api/orpc`   |

Namespace keys match **`module/<feature>`** names (`teams`, `projects`, …).

---

## OrpcContext (required fields)

Procedures receive context built once per request. **Minimum:**

| Field       | Purpose                             |
| ----------- | ----------------------------------- |
| `userId`    | Actor                               |
| `session`   | Better Auth session reference       |
| `orgId`     | When route is org-scoped (nullable) |
| `projectId` | Project-scoped actions (nullable)   |
| `teamId`    | Team-scoped actions (nullable)      |
| `ip`        | Audit                               |
| `userAgent` | Audit                               |

`runAction` and `buildAccessContext` (see [actions-audit.md](./actions-audit.md)) consume the same shape. **Do not** invent parallel `{ userId }` only contexts in new procedures.

---

## Middleware order (fixed)

1. **Auth** — reject unauthenticated when procedure requires session
2. **Scope** — attach org/project/team from route or input (validated)
3. **Handler** — controller → `runAction` / service
   Permission evaluation lives **inside controller via `runAction`**, not duplicated in procedure middleware, unless platform adds a shared `gatedProcedure(actionId)` that still delegates to the same `runAction` path.

---

## HTTP status vs ServiceResponse

**Policy for new product JSON (oRPC):**

- HTTP **200** with **`ServiceResponse`** body for expected outcomes (`success`, `failed`, `error`).
- Do **not** mix TRPC-style `FORBIDDEN` throws for expected permission deny — map to **`failed`** + audit `denied`.

Route handlers that are not oRPC may use HTTP status codes, but JSON body should still use **ServiceResponse** when returning product errors to the Studio UI.

---

## MCP

MCP tools call the **same controller** as oRPC. Tool result payload exposes **`status`, `data`, `message`, `error`** (same semantics). See [contracts.md](./contracts.md).

---

## Related

- [imports-paths.md](./imports-paths.md) — client import path
- [server-folders.md](./server-folders.md) — controller vs handlers
- [forbidden-defaults.md](./forbidden-defaults.md) — no domain in `packages/orpc/src/modules`
