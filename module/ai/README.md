# ai module

AI policy, usage metering, and guarded generation/tool entrypoints.

## Moved (feat/architecture-layers)

Handlers live under `server/api/` (migrated from legacy `packages/api` / `packages/orpc/src/modules/ai`).

tRPC routers import `@modules/ai/server/api/*`.

See [module/README.md](../README.md).
