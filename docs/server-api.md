# Server APIs (oRPC, Route Handlers, Server Actions)

How **server-side** product APIs are structured. All **business logic** lives in **`module/<feature>/server`** (or **`module/shared`**). **`apps/*/src/app`** only imports and calls — no domain logic.

**Target state:** **oRPC only** for typed RPC from the browser. **tRPC is legacy** and will be removed; do not add new tRPC procedures.

See also: [modules.md](./modules.md), [packages.md](./packages.md), [data-workflow.md](./data-workflow.md) (ServiceResponse on every controller).

---

## One rule

**Every server entrypoint** (oRPC procedure, Server Action, Next `route.ts`, MCP tool, RSC page loader) calls into **`module/…/server`** — never implements DB, permissions, or domain rules in `apps/` or fat handlers in `packages/orpc`.

```text
┌─────────────────────────────────────────────────────────────┐
│  module/<feature>/server/controller  →  service            │
│  module/shared/server/…  (cross-feature only)               │
└────────────────────────────▲──────────────────────────────┘
                             │
     ┌───────────────────────┼───────────────────────┐
     │                       │                       │
  oRPC HTTP              Server Action          app/api/route.ts
  /api/orpc              "use server"           (streams, cron, …)
     │                       │                       │
     └─────────── packages/orpc (thin wire only) ──┘
                             │
                    RSC page / layout in module
                    (server fn → props → client component)
```

---

## Where code lives

| Kind                        | Logic                                         | App / package surface                                                            |
| --------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------- |
| **oRPC** (product JSON API) | `module/<feature>/server`                     | `@loftlancer/orpc` oRPC router: auth context, procedure shell, → controller      |
| **Server Action**           | `module/<feature>/server`                     | `apps/.../actions.ts` or re-export: `"use server"` → one controller call         |
| **Next Route Handler**      | `module/<feature>/server`                     | `apps/.../route.ts`: session/cron/webhook check → controller                     |
| **RSC pages**               | `module/<feature>/server` + `client/…/rsc`    | `apps/.../page.tsx`: import server fn + client component; **pass data as props** |
| **MCP tools**               | `module/<feature>/server`                     | `@loftlancer/mcp` (SDK) + `@loftlancer/orpc/mcp` → controller                    |
| **Shared across features**  | `module/shared/server`, `module/shared/utils` | Not `packages/orpc`                                                              |

**`packages/`** stays platform (db, actions, auth, env, oRPC/tRPC bootstrap during migration). See [packages.md](./packages.md).

---

## oRPC (only RPC protocol going forward)

| Layer                          | Responsibility                                                                                      |
| ------------------------------ | --------------------------------------------------------------------------------------------------- |
| **`module/<feature>/server`**  | Controllers + services — **all** reads/writes                                                       |
| **`packages/orpc`**            | Request context, procedure registration, permission middleware, map errors — **delegate to module** |
| **`apps/*/src/app/api/orpc/`** | Single catch-all handler: `RPCHandler` + `createContextWithAuth` — **no procedures here**           |
| **Client**                     | `@orpc/client` + TanStack Query from module `client/…/hooks` — **not** tRPC                         |

During migration, existing tRPC routes and `toORPCRouter(trpcRouter)` remain until removed; **new endpoints are oRPC-first** and implemented under `module/…/server` only once.

Studio mounts **`studioORPCRouter`**; Auth settings mounts **`accountORPCRouter`**. Domain procedures are grouped by namespace (`teams`, `projects`, …) matching module names.

---

## Next.js `app/` folder (bare)

**Allowed in `apps/*/src/app/**`:**

- `page.tsx` / `layout.tsx`: metadata, re-export or **one line** calling a **module** server page function; render module client component with **props**
- `route.ts`: import handler from `module/…/server` or `@loftlancer/orpc` platform helper; call it
- Platform-only: Better Auth catch-all, health, cron entry (still delegate business steps to module when product-related)

**Not allowed in `app/`:**

- DB queries, `requireAction`, Zod business schemas, audit writes
- Large JSX feature UI (belongs in `module/…/client`)
- Duplicate validation or service logic

**Page pattern (target):**

```tsx
// apps/studio/src/app/…/teams/[teamId]/page.tsx — illustrative
import { TeamOverviewPage } from "@module/teams/client/studio/rsc/client.overview.page";

export default TeamOverviewPage;
```

Or, if the app file stays explicit:

```tsx
import { loadTeamOverview } from "@module/teams/server/page/server.team-overview.page";
import { TeamOverviewContent } from "@module/teams/client/studio/components/client.overview.content";

export default async function Page({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const data = await loadTeamOverview(teamId);
  return <TeamOverviewContent initial={data} teamId={teamId} />;
}
```

All logic inside `loadTeamOverview` in **`module/teams/server`**, not in the app file.

---

## Server Actions

- Prefer **oRPC** for anything the client refetches or shares with MCP/RPC inventory.
- When a Server Action is used: file in **`module/<feature>/server/actions/`** (or controller re-export); app only re-exports with `"use server"`.
- Action body = **same controller** as oRPC would call (one implementation).

---

## Next Route Handlers (`app/api/.../route.ts`)

Use when HTTP shape is not oRPC: **file streams**, **webhooks**, **cron secrets**, **OAuth**, **MCP on docs**, etc.

- Handler implementation in **`module/<feature>/server/handlers/`** (or `server/controller/server.download-file.ts`).
- `route.ts` = auth/context + `return handler(request)`.

Example direction (files download): move logic from app route to `module/files/server/…`; route imports one function.

---

## `module/shared`

Cross-feature server or utils that **no single domain owns**:

```text
module/shared/
├── utils/          # shared validation/types (use sparingly)
└── server/         # shared controllers/services (e.g. pagination helpers — not product domains)
```

If logic belongs to one product area, put it in **`module/<that-feature>/`**, not shared.

---

## Client data flow (pages)

Documented in [rendering.md](./rendering.md): server page functions → props → server layout; client slices via **`dynamic()` + skeleton**; hooks/functions own fetch and UI state.

---

## Checklist (new server API)

- [ ] Implementation in `module/<feature>/server/` (controller + service).
- [ ] Schemas in `module/<feature>/utils/validation/`.
- [ ] oRPC procedure wired in `@loftlancer/orpc` (not duplicated in app).
- [ ] If Server Action or `route.ts`: app file imports module only.
- [ ] No new tRPC.
- [ ] [product.md](./product.md) if gated; [CHANGELOG.md](../CHANGELOG.md) on merge to `dev`.

---

## Related

- [modules.md](./modules.md) — module internal layout
- [packages.md](./packages.md) — `@loftlancer/orpc` transport
- [product.md](./product.md) — permissions and audit
