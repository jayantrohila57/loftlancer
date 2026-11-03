# `@loftlancer/orpc`

**RPC transport shell** for Loftlancer. Named after the primary library **`@orpc/*`**.

Formerly `@loftlancer/api` / `packages/api`. This package is **not** a product domain and must not grow new business rules.

## Libraries

| Library                                                | Role                                                                              |
| ------------------------------------------------------ | --------------------------------------------------------------------------------- |
| `@orpc/server`, `@orpc/client`, `@orpc/tanstack-query` | **Target** typed RPC                                                              |
| `@orpc/trpc` (`toORPCRouter`)                          | Temporary bridge over legacy tRPC routers                                         |
| `@trpc/server`, `@trpc/client`                         | **Legacy** — isolate under `src/routers/` + `src/index.ts`; do not add procedures |

Cross-cutting procedure helpers live in **`features/api`** (friendly errors, etc.) — different from this package.

## Layout (provider-prefixed)

```text
packages/orpc/src/
├── core/           # orpc.create-context.ts, orpc.context.ts
├── config/         # orpc.config.ts
├── constants/      # orpc.constants.ts
├── utils/          # orpc.transformer.ts, orpc.errors.ts
├── orpc/           # studio + account oRPC routers (thin → module controllers)
├── mcp/            # MCP HTTP wiring → module controllers
├── page-guards/    # Next page guard glue (imports @features/*, @modules/*)
├── actions/        # requireAction host registration + transport RBAC glue
└── routers/        # LEGACY tRPC composition — burn down
```

Domain handlers live in **`module/<domain>/`** (`@modules/*`); do not recreate `src/modules/`.

**Canonical imports:** `@loftlancer/orpc/core/orpc.create-context`, `@loftlancer/orpc/utils/orpc.transformer`, `@modules/*`, `@features/*` (from apps/modules — not new domain shims under `packages/orpc/src/`).

## TODO (blocked)

| Item                                   | Blocked on                                                               | Notes                             |
| -------------------------------------- | ------------------------------------------------------------------------ | --------------------------------- |
| Fat **tRPC** `src/routers/*`           | Per-domain module migrations                                             | Thin adapters only; no new tRPC   |
| `src/routers/*` bodies → controllers   | `module/projects`, `module/environments`, `module/files`, `module/ai`, … | Largest remaining domain surface  |
| Remove `@trpc/*` + `toORPCRouter`      | Native oRPC per domain                                                   |                                   |
| Delete legacy **`packages/api/`** tree | Consumers fully on `@loftlancer/orpc` + `module/`                        | Duplicate of pre-rename transport |

## Verify

```bash
pnpm --filter @loftlancer/orpc check-types
pnpm --filter @loftlancer/orpc test
pnpm audit:module-architecture
pnpm audit:architecture-layers
```

## Related

- [docs/packages.md](../../docs/packages.md)
- [docs/server-api.md](../../docs/server-api.md)
- [docs/gaps/orpc-transport.md](../../docs/gaps/orpc-transport.md)
- [AGENTS.md](./AGENTS.md)
