# Web app

Site root app (no `basePath`).

|                     |                                                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Local dev           | **`http://localhost:3001/en-us`** — Next prints `Local: http://localhost:3001`; **`/`** redirects to **`/en-us`**. |
| Locales in URL      | `/en-us`, `/en-in`, `/es-es` (`localePrefix: always`)                                                              |
| Auth (separate app) | **`http://localhost:3002/auth/en-us`** — see [../auth/README.md](../auth/README.md)                                |

Running **`pnpm dev`** at repo root starts **web** and **auth** via Turbo. `cache bypass, force executing` is normal for dev tasks (not disabled caching in your app).

## Environment

Validated with **T3 Env** (`@/shared/config/web.server-env` → `@packages/t3-env`). Copy `apps/web/.env.example` to `.env`. Include **`DATABASE_URL`** when using the DB health route or Drizzle from this app.

## DB health

`GET http://localhost:3001/api/health/db` — `@modules/health`. See [../modules/health-checks.md](../modules/health-checks.md).

## Marketing analytics (PostHog)

`WebPostHog` stays **opted out** (`consent: "denied"`) until a public marketing consent banner ships. Do not set `NEXT_PUBLIC_POSTHOG_*` in production without that UX. See `apps/web/src/shared/analytics/web.posthog.client.tsx`.
