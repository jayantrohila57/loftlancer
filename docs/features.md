# Reusable features (`features/`)

**`features/`** holds **domain-independent platform capabilities** that multiple modules (and apps) compose: authorization helpers, audit plumbing, shared forms, data-table patterns, validation utilities, notification orchestration, and similar cross-cutting product infrastructure.

**Follow this document when you add or move reusable logic** that is not owned by a single product domain. Full domain behavior (teams, organizations, account settings, …) stays in **[modules.md](./modules.md)** (`module/`). Vendor SDK wiring stays in **[packages.md](./packages.md)** (`packages/`).

Operational runbooks for a specific feature live in **`features/<name>/README.md`**, not long-form docs under `docs/`.

---

## Four layers (dependency direction)

```text
apps/*  →  module/*  →  features/*  →  packages/*
         ↘  features/*  ↗
```

| Layer        | Path                                                | Owns                                                                                                        |
| ------------ | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Apps**     | `apps/www`, `apps/auth`, `apps/studio`, `apps/docs` | Routing, layouts, composition — import modules and features; almost no business rules                       |
| **Modules**  | `module/<domain>/`                                  | Complete domain: server APIs, policies, schemas, types, domain client UI                                    |
| **Features** | `features/<name>/`                                  | Reusable systems any module may consume (RBAC/ABAC consumption, forms, tables, audit, notifications, …)     |
| **Packages** | `packages/*` (`@loftlancer/*`)                      | Third-party integrations and SDK initialization (DB, Better Auth, mail, env, …) — no product business logic |

**Allowed imports**

- Apps → modules, features, packages
- Modules → features, packages, `module/shared/`
- Features → packages only
- Packages → other packages (infra), not modules or features
  **Forbidden**

- **`features/*` → `module/*`** (features never depend on a domain)
- **`packages/*` → `module/*` or `features/*`** except documented transport allowlist below
- **Modules → apps** (no `@/` app internals from module code)

---

## Internal layout (`features/<name>/`)

Mirror modules where the feature has server and UI surface:

```text
features/<name>/
├── shared/     # Types, Zod, mappers — no React, no DB unless feature-owned
├── server/     # Server-only helpers consumed by module controllers or oRPC glue
└── client/     # Reusable client components and hooks ("use client" at leaves)
```

Not every feature needs all three; a server-only audit helper may omit `client/`. File naming follows the same layer-prefix rules as `module/` ([naming.md](./naming.md)).

**Import alias:** `@features/<name>/…` → `features/<name>/src/…` (see [tooling.md](./tooling.md)). Each feature is a workspace package: **`features/<name>/package.json`** (`@loftlancer/features-<name>`).

---

## Features vs modules

| Question                                                                  | Put it in          |
| ------------------------------------------------------------------------- | ------------------ |
| Only meaningful for one product domain (org billing, team membership, …)? | `module/<domain>/` |
| Used by many domains with no domain-specific rules?                       | `features/<name>/` |
| Drizzle schema, Better Auth config, PostHog init?                         | `packages/*`       |

When migrating legacy code from `packages/orpc` or fat app folders, prefer **`features/`** for cross-domain behavior and **`module/`** for domain rules.

---

## Packages importing modules or features (allowlist)

`@loftlancer/orpc` is **transport**: oRPC/MCP/tRPC shells may delegate to `module/…/server` during migration. No other package may import `@module/*` or `@features/*`.

**Allowed paths** (prefix match under repo root):

| Prefix                                                                                 | Reason                                                                              |
| -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `packages/orpc/src/orpc/`                                                              | oRPC procedure shells → module controllers                                          |
| `packages/orpc/src/mcp/`                                                               | MCP tool wiring → module controllers                                                |
| `packages/orpc/src/routers/`                                                           | Legacy tRPC adapters → module controllers (remove with tRPC)                        |
| `packages/orpc/src/actions/`, `page-guards/`, `support/`, `modules/`                   | Deprecated shims → `@features/*` / `@modules/*`                                     |
| `packages/orpc/src/organization-*.ts`, `sidebar-favorites.ts`, `invitation-preview.ts` | Domain shims during rename burn-down                                                |
| `packages/orpc/src/project-access/`, `member-access/`                                  | Domain blobs until `module/projects` (+ access) migration                           |
| `packages/orpc/src/errors.ts`, `utils/orpc.errors.ts`                                  | Friendly-error re-export → `@features/api`                                          |
| `packages/better-auth/src/`                                                            | Better Auth server + React client use authorization AC / action types from features |
| `packages/mcp/src/`                                                                    | MCP scope helpers from `@features/authorization/utils`                              |
| `packages/drizzle/scripts/`                                                            | Seed/stress scripts referencing action registry                                     |

Everything else under `packages/` must not reference `module/` or `features/`. CI enforces this via **`pnpm audit:architecture-layers`**.

---

## Checklist (new or changed feature)

- [ ] GitHub issue; scope is cross-domain reuse, not a single module’s rules
- [ ] Code under `features/<name>/` with `shared/` \| `server/` \| `client/` as needed
- [ ] No imports from `@module/*` or `module/`
- [ ] Module README or feature README documents consumption pattern
- [ ] **`pnpm audit:architecture-layers`** — no new violations
- [ ] [CHANGELOG.md](../CHANGELOG.md) `[Unreleased]` when merged to `dev`

---

## Related

- [modules.md](./modules.md) — domain modules (`module/`)
- [packages.md](./packages.md) — platform packages
- [server-api.md](./server-api.md) — oRPC transport vs module server
- [index.md](./index.md) — doc map
