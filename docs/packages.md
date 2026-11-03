# Platform packages (`packages/`)

**`packages/`** holds **workspace libraries** (`@loftlancer/*`) shared across apps. These are **pnpm packages** with their own `package.json`.

**Do not put product or reusable application logic here.** Domain code belongs in **[module/](./modules.md)**; cross-domain reusable systems belong in **[features/](./features.md)**. Packages provide **third-party integrations and SDK initialization** that modules, features, and apps depend on.

---

## What packages are responsible for

| Responsibility | Owner |
|----------------|--------|
| Database schema and migrations | `@loftlancer/db` |
| Action IDs, org roles, RBAC evaluation data | `@loftlancer/actions` |
| Authentication server (Better Auth) | `@loftlancer/auth` |
| Auth client for React apps | `@loftlancer/auth-client` |
| Design system and generic UI patterns | `@loftlancer/ui` |
| Environment variables and feature flags | `@loftlancer/env` |
| Encryption for secret values | `@loftlancer/crypto` |
| Notification types and delivery helpers | `@loftlancer/notifications` |
| Transactional email | `@loftlancer/email`, `@loftlancer/mail` |
| Logging | `@loftlancer/logger` |
| MCP tool catalog and MCP-specific glue | `@loftlancer/mcp` |
| Shared TS/Biome config | `@loftlancer/config` |
| **RPC transport shell** (oRPC routers — thin; tRPC legacy until removed) | `@loftlancer/api` |

---

## `@loftlancer/api` — transport only

The API package wires **how** clients call the backend, not **what** each feature does. **All implementations live in `module/…/server`.** See [server-api.md](./server-api.md).

**Target:** **oRPC-only** RPC. tRPC is legacy and being removed; do not add new tRPC procedures.

**May contain:**

- oRPC router definitions that **delegate** to `module/<feature>/server/controller`
- Request context (`create-context`), shared error formatting, procedure middleware (org session, action guards)
- MCP HTTP wiring → module controllers
- Page guards for Next.js (action names from `@loftlancer/actions`)
- **During migration:** tRPC init, `toORPCRouter(trpcRouter)`, old routers — delete as domains move to oRPC + module

**Must not contain (use `module/` instead):**

- Business rules for a single product area (team CRUD, org lifecycle, project access, variable import, …)
- Domain validation modules tied to one feature (move to `module/<feature>/utils`)
- Domain UI
- Growing `src/modules/<feature>/` trees — **legacy**; do not add new files there
- Monolithic MCP operation bodies (e.g. large org/team impl files) — split into `module/<feature>/server`

During migration, old paths may still exist; **new and moved code** follows the rules above.

---

## Internal layout (`packages/api`)

Feature logic **must not** be added here; only wiring and platform glue.

```text
packages/api/src/
├── create-context.ts        # Session, org, IP, user-agent
├── orpc/                    # Studio + account oRPC routers (target: native oRPC, not tRPC mirror)
├── mcp/                     # Tool registration → module controllers
├── page-guards/
├── actions/                 # actionGuard helpers for oRPC middleware
└── (legacy) routers/, index.ts, modules/   # tRPC — remove over time
```

Apps mount **`/api/orpc`** for product RPC. **`/api/trpc`** is removed with tRPC.

**Target procedure:** schema from `@module/…/utils/validation`, middleware for gated actions, handler → `module/…/server/controller`.

Feature logic **must not** be added under `packages/api`; see [server-api.md](./server-api.md).

---

## Other packages (internal sketch)

| Package | Typical layout |
|---------|----------------|
| `@loftlancer/db` | `src/schema/*.ts`, migrations, soft-delete helpers |
| `@loftlancer/actions` | `src/registry-data.ts` → generated registry |
| `@loftlancer/ui` | `src/components/`, `src/patterns/` — generic UI only |
| `@loftlancer/auth` | Better Auth config and server plugins |
| `@loftlancer/env` | `src/*.ts` Zod env + feature flags |
| `@loftlancer/mcp` | Tool metadata/docs; execution delegates through `@loftlancer/api` → `module/` |
| `@loftlancer/config` | Shared `tsconfig`, Biome — no product code |

---

## Apps (`apps/*`) vs packages

| Path | Role |
|------|------|
| `apps/docs`, `apps/auth`, `apps/studio` | Next.js apps: routing, layouts, deploy boundaries |
| `apps/*/src/app/**` | **Import and call only** — pages, layouts, `route.ts`, Server Action re-exports; logic in `module/` ([server-api.md](./server-api.md)) |
| `packages/*` | Importable libraries — **no** Next routes |

Apps **must not** duplicate domain logic that should live in `module/`.

---

## Dependency direction

Full stack: **[features.md](./features.md)**. Summary:

```text
apps/*       →  module/*, features/*, packages/*
module/*     →  features/*, packages/*, module/shared/
features/*   →  packages/* only
packages/*   →  other packages (infra) — not module/* or features/* except API transport allowlist

packages/api/orpc|mcp|routers  →  module/<domain>/server  (transport shells only)
```

**Layer audit:** **`pnpm audit:architecture-layers`** fails on `features/* → module/*` and forbidden `packages/*` imports. Allowlisted transport paths are listed in [features.md](./features.md).

```text
module/*  ↛  apps/* (domain code does not import app internals)
packages/*  ↛  module/client or features/client (platform packages do not import domain UI)
```

---

## Adding or changing a package

- Needs a **GitHub issue** and a clear **platform** justification (shared infra, not one feature).
- New `@loftlancer/*` package: add under `packages/`, wire in `pnpm-workspace.yaml`, document env vars in [integrations.md](./integrations.md) if applicable.
- Do **not** create a `packages/teams` or `packages/domain-*` for product features — use **`module/teams/`** instead.

---

## Related

- [server-api.md](./server-api.md) — oRPC, Server Actions, Next routes, bare `app/`  
- [features.md](./features.md) — reusable features layer  
- [modules.md](./modules.md) — domain modules  
- [product.md](./product.md) — permissions and audit  
- [index.md](./index.md) — doc map  
