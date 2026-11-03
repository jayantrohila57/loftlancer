# support module

Help center, FAQ, and support tickets (studio + tRPC `support` router).

## Layout

| Layer     | Role                                                               |
| --------- | ------------------------------------------------------------------ |
| `server/` | Ticket/FAQ services, support page guards, audit helpers            |
| `utils/`  | Pure permission predicates (`SupportAccessContext`)                |
| `client/` | Studio UI (still migrating from `apps/studio/src/module/support/`) |

## Moved (feat/architecture-layers)

| From                                       | To                                         |
| ------------------------------------------ | ------------------------------------------ |
| `packages/orpc/src/support/manager.ts`     | `server/server.support-manager.service.ts` |
| `packages/orpc/src/support/permissions.ts` | `utils/utils.support-permissions.ts`       |
| `packages/orpc/src/support/audit.ts`       | `server/server.support-audit.service.ts`   |
| `packages/orpc/src/page-guards/support.ts` | `server/server.support-page-guards.ts`     |

`packages/orpc/src/routers/support.ts` remains a **thin tRPC shell** calling `@modules/support/*`. `packages/orpc/src/support/*` files are deprecated re-exports.

## Verify

```bash
pnpm --filter @loftlancer/orpc exec tsc --noEmit
```

See [module/README.md](../README.md).
