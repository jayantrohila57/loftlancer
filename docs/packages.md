# Platform packages (`packages/`)

**`packages/`** holds **workspace libraries** (`@loftlancer/*`) shared across apps. These are **pnpm packages** with their own `package.json`.

**Do not put product or reusable application logic here.** Domain code belongs in **[module/](./modules.md)**; cross-domain reusable systems belong in **[features/](./features.md)**. Packages provide **third-party integrations and SDK initialization** that modules, features, and apps depend on.

---

## What packages are responsible for

| Responsibility                                                                         | Owner                            |
| -------------------------------------------------------------------------------------- | -------------------------------- |
| Database schema and migrations                                                         | `@loftlancer/drizzle`            |
| Action IDs, org roles, RBAC evaluation data                                            | `@features/authorization/utils`  |
| Authentication server (Better Auth)                                                    | `@loftlancer/better-auth`        |
| Auth client for React apps                                                             | `@loftlancer/better-auth/client` |
| Design system and generic UI patterns (naming exception — see `packages/ui/README.md`) | `@loftlancer/ui`                 |
| Environment variables and feature flags                                                | `@loftlancer/t3-env`             |
| Encryption for secret values (Node `node:crypto` AES-256-GCM)                          | `@loftlancer/crypto`             |
| Transactional email (Resend + React Email)                                             | `@loftlancer/resend`             |
| Sentry (error reporting + Logs sink)                                                   | `@loftlancer/sentry`             |
| MCP SDK init / resource auth / CORS / rate-limit glue                                  | `@loftlancer/mcp`                |
| Shared TypeScript base config                                                          | `@loftlancer/typescript-config`  |
| **RPC transport shell** (oRPC routers — thin; tRPC legacy until removed)               | `@loftlancer/orpc`               |

---

## `@loftlancer/orpc` — transport only

The API package wires **how** clients call the backend, not **what** each feature does. **All implementations live in `module/…/server`.** See [server-api.md](./server-api.md).

**Target:** **oRPC-only** RPC. tRPC is legacy and being removed; do not add new tRPC procedures.

**May contain:**

- oRPC router definitions that **delegate** to `module/<feature>/server/controller`
- Request context (`create-context`), shared error formatting, procedure middleware (org session, action guards)
- MCP HTTP wiring → module controllers
- Page guards for Next.js (action names from `@features/authorization/utils`)
- **During migration:** tRPC init, `toORPCRouter(trpcRouter)`, old routers — delete as domains move to oRPC + module

**Must not contain (use `module/` instead):**

- Business rules for a single product area (team CRUD, org lifecycle, project access, variable import, …)
- Domain validation modules tied to one feature (move to `module/<feature>/utils`)
- Domain UI
- Growing `src/modules/<feature>/` trees — **legacy**; do not add new files there
- Monolithic MCP operation bodies (e.g. large org/team impl files) — split into `module/<feature>/server`

During migration, old paths may still exist; **new and moved code** follows the rules above.

---

## Internal layout (`packages/orpc`)

Feature logic **must not** be added here; only wiring and platform glue.

```text
packages/orpc/src/
├── create-context.ts        # Session, org, IP, user-agent
├── orpc/                    # Studio + account oRPC routers (target: native oRPC, not tRPC mirror)
├── mcp/                     # Tool registration → module controllers
├── page-guards/
├── actions/                 # actionGuard helpers for oRPC middleware
└── (legacy) routers/, index.ts, modules/   # tRPC — remove over time
```

Apps mount **`/api/orpc`** for product RPC. **`/api/trpc`** is removed with tRPC.

**Target procedure:** schema from `@module/…/utils/validation`, middleware for gated actions, handler → `module/…/server/controller`.

Feature logic **must not** be added under `packages/orpc`; see [server-api.md](./server-api.md).

---

## Other packages (internal sketch)

| Package                         | Typical layout                                                                                                                                                                                      |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@loftlancer/drizzle`           | `src/{core,config,constants,types,utils}/`, `src/schema/`, migrations, soft-delete helpers                                                                                                          |
| `@loftlancer/ui`                | `src/components/ui/` (shadcn/coss CLI), `src/lib/utils.ts`, `globals.css` — **primitives only**; patterns in `features/patterns`, tables in `features/data-table`, shell chrome in `features/shell` |
| `@loftlancer/auth`              | Better Auth config and server plugins                                                                                                                                                               |
| `@loftlancer/t3-env`            | `src/{core,config,constants,types,utils}/t3-env.*` — `@t3-oss/env-*` + Zod                                                                                                                          |
| `@loftlancer/crypto`            | `src/{core,config,constants}/node-crypto.*.ts` — Node AES-256-GCM only                                                                                                                              |
| `@loftlancer/resend`            | `src/{core,config,constants,types,utils}/resend.*.ts` + React Email templates under `core/templates/`                                                                                               |
| `@loftlancer/mcp`               | MCP SDK HTTP/auth/CORS/rate-limit; tool catalogs via `@loftlancer/orpc/mcp` → `module/`                                                                                                             |
| `@loftlancer/typescript-config` | Shared `tsconfig.base.json` — no product code; Biome stays at repo root                                                                                                                             |

---

## Apps (`apps/*`) vs packages

| Path                                    | Role                                                                                                                                   |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/docs`, `apps/auth`, `apps/studio` | Next.js apps: routing, layouts, deploy boundaries                                                                                      |
| `apps/*/src/app/**`                     | **Import and call only** — pages, layouts, `route.ts`, Server Action re-exports; logic in `module/` ([server-api.md](./server-api.md)) |
| `packages/*`                            | Importable libraries — **no** Next routes                                                                                              |

Apps **must not** duplicate domain logic that should live in `module/`.

---

## Dependency direction

Full stack: **[features.md](./features.md)**. Summary:

```text
apps/*       →  module/*, features/*, packages/*
module/*     →  features/*, packages/*, module/shared/
features/*   →  packages/* only
packages/*   →  other packages (infra) — not module/* or features/* except API transport allowlist

packages/orpc/orpc|mcp|routers  →  module/<domain>/server  (transport shells only)
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
