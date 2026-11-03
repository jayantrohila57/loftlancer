# files module

Project file uploads and private file access.

## Moved (feat/architecture-layers)

Handlers live under `server/api/` (migrated from legacy `packages/api` / `packages/orpc/src/modules/files`).

tRPC routers import `@modules/files/server/api/*`.

See [module/README.md](../README.md).
