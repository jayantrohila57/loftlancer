# notifications feature

## Naming and layout

See [features/NAMING.md](../NAMING.md) (`<feature>.<purpose>.<suffix>` under `src/core/*`, `config/`, `constants/`, `types/`, `utils/`; tests in `tests/`).


Cross-cutting **in-app + email notification** types, preferences, renderers, audit/invitation triggers, and delivery (`notify` / DB insert via Drizzle + `@loftlancer/resend`).

Import via `@features/notifications/…` (sources under `src/`). Package: `@loftlancer/feature-notifications`.

**Flag:** `@loftlancer/t3-env/notifications` (`NOTIFICATIONS_ENABLED`).

## Layout

```text
features/notifications/
  package.json
  src/
    index.ts
    config/          # feature env wiring
    constants/       # notification type ids
    types/           # shared TS types
    utils/           # schemas, renderers, preferences, presentation
    core/
      server/        # notify, audit dispatch, triggers, e2e helpers
      client/        # reserved for notification UI
  tests/
  server/ shared/    # deprecated re-exports (compat)
```

| Path                                               | Owns                                     |
| -------------------------------------------------- | ---------------------------------------- |
| `utils/notifications.registry.utils.ts`            | Zod payloads + renderers                 |
| `utils/notifications.preferences.utils.ts`         | User preference schema + grouping        |
| `utils/notifications.presentation.utils.ts`        | List/bell presentation resolver          |
| `core/server/notifications.notify.ts`              | Idempotent row insert + optional email   |
| `core/server/notifications.from-audit.ts`          | Registry `notifyOn` dispatch after audit |
| `core/server/notifications.invitations.trigger.ts` | Invitation received/accepted workflows   |
| `core/server/notifications.e2e-prepare.ts`         | Playwright prepare helpers               |

Better Auth session hook claims pending email rows via `linkPendingNotificationsForUser` on `@loftlancer/better-auth` product hooks (`features/authentication/server/register-better-auth-product-hooks`).

## Verification

```bash
pnpm --filter @loftlancer/features-notifications check-types
pnpm audit:architecture-layers
```

See [features/README.md](../README.md).
