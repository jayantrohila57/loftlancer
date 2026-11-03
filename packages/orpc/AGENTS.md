# `@loftlancer/orpc` (Codex scope)

Layers on root [AGENTS.md](../../AGENTS.md) and [module/AGENTS.md](../../module/AGENTS.md).

Formerly **`@loftlancer/api`**. Operational detail: [README.md](./README.md).

## What stays here (transport only)

- **Context & procedure shell:** `core/orpc.create-context.ts`, `index.ts` (tRPC init/middleware — legacy), `utils/orpc.transformer.ts`, `utils/orpc.errors.ts`
- **Router composition:** `src/routers/*` (legacy tRPC), `src/orpc/*` (studio/account oRPC)
- **MCP HTTP adapters:** `src/mcp/*` → module controllers
- **Framework glue:** `src/actions/*`, `src/page-guards/*` (often re-exports of `@features/*`)
- **Host registration:** `src/actions/require-action-host-register.ts`

## Forbidden

- New product logic under `src/modules/<domain>/` or fat handlers in routers/MCP
- New **tRPC** procedures — use `src/orpc/procedures/<domain>.ts` → `module/<domain>/server`

## Verify after edits

```bash
pnpm --filter @loftlancer/orpc exec tsc --noEmit
pnpm audit:module-architecture
pnpm audit:architecture-layers
```
