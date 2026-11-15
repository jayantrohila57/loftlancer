# Vercel deploy (monorepo Services)

Single production domain with **Vercel Services** — root [`vercel.json`](../../vercel.json). Local dev stays multi-port ([web-dev.md](./web-dev.md), [auth-dev.md](./auth-dev.md), [studio-dev.md](./studio-dev.md), [console-dev.md](./console-dev.md)).

## Service map

| Service   | App root       | Public path   | `next-intl` URLs (production) | `basePath` today                         |
| --------- | -------------- | ------------- | ----------------------------- | ---------------------------------------- |
| `web`     | `apps/web`     | `/` (default) | `/en-us`, `/en-in`, `/es-es`  | none                                     |
| `auth`    | `apps/auth`    | `/auth/*`     | `/auth/en-us`, …              | `/auth` in `next.config.ts` (fixed)      |
| `studio`  | `apps/studio`  | `/studio/*`   | `/studio/en-us`, …            | `/studio` via `NEXT_BASE_PATH` at build  |
| `console` | `apps/console` | `/console/*`  | `/console/en-us`, …           | `/console` via `NEXT_BASE_PATH` at build |

Rewrites send traffic to the matching service before the `web` catch-all (`/:path*`). Order matters: **auth → studio → console → web**.

## Build

From repo root via each service’s `installCommand` / `buildCommand` in `vercel.json` (`pnpm install`, `pnpm turbo run build --filter=<name>`). `VERCEL_SERVICES=1` and `NEXT_BASE_PATH` are listed in root `turbo.json` `globalEnv`.

**Studio / console:** `vercel.json` passes `NEXT_BASE_PATH=/studio` and `/console` at build time. Each app reads it in `app.config.ts` + `next.config.ts` (`basePath`, `NEXT_PUBLIC_BASE_PATH`). Local dev omits `NEXT_BASE_PATH` (no mount). Auth hard-codes `/auth` and does not use `NEXT_BASE_PATH`.

## Environment (preview + production)

Set on the **Vercel project** (shared across services unless you split projects):

| Variable                                  | Example (single domain)                                                                     |
| ----------------------------------------- | ------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                            | Postgres (Neon, etc.)                                                                       |
| `BETTER_AUTH_SECRET`                      | 32+ chars                                                                                   |
| `BETTER_AUTH_URL`                         | `https://<domain>/auth`                                                                     |
| `NEXT_PUBLIC_AUTH_APP_URL`                | same as `BETTER_AUTH_URL`                                                                   |
| `APP_PUBLIC_URL`                          | Per-app canonical URL (Auth build uses auth URL; Studio `https://<domain>/studio`, etc.)    |
| `STUDIO_APP_URL`                          | `https://<domain>/studio`                                                                   |
| `CONSOLE_APP_URL`                         | `https://<domain>/console`                                                                  |
| `CRON_SECRET`                             | Random secret; Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`                      |
| `BLOB_READ_WRITE_TOKEN` / `BLOB_STORE_ID` | When Blob uploads are enabled                                                               |
| `NEXT_PUBLIC_SENTRY_DSN` / `SENTRY_*`     | Optional error reporting ([`@packages/sentry`](../../packages/sentry/AGENTS.md))            |
| `OBSERVABILITY_TRACING_*` / `OTEL_*`      | Optional OTLP tracing ([`@packages/observability`](../../packages/observability/AGENTS.md)) |
| `NEXT_PUBLIC_POSTHOG_*`                   | Optional product analytics (Studio; consent via Account → Privacy)                          |
| `MCP_RESOURCE_URL`                        | Auth MCP protected resource (`https://<domain>/auth/api/mcp`)                               |

Enable **Vercel Web Analytics** and **Speed Insights** in the Vercel project dashboard (no env vars — wired via `@packages/analytics`).

OAuth callback URLs must include Auth `basePath`, e.g. `https://<domain>/auth/api/auth/callback/github`.

## Cron

| Path                           | Handler                                             | Schedule (`vercel.json`)      |
| ------------------------------ | --------------------------------------------------- | ----------------------------- |
| `/auth/api/cron/storage-purge` | `apps/auth/src/app/api/cron/storage-purge/route.ts` | Daily `0 3 * * *` (03:00 UTC) |

Requires `CRON_SECRET` in production (dev allows missing secret). No other cron route handlers exist in the repo yet; future jobs (e.g. entitlements reconcile from [requirements](../work/requirements/entitlements-design-answers.md)) should be added here only after `route.ts` exists.

## Dashboard checklist

1. **New project** → import repo → confirm root `vercel.json` is detected (Vercel Services).
2. **Node** ≥ 26 (see root `package.json` `engines`).
3. **Environment variables** — table above; mark secrets for Production and Preview as needed.
4. **Cron** — confirm job appears after deploy; first run hits Auth with Bearer `CRON_SECRET`.
5. **Blob** — link store to project when storage uploads ship.
6. **Git** — `git.deploymentEnabled` in `vercel.json` limits auto-deploys to `main`; adjust branch name if your default differs.
7. **Smoke** — `GET /api/health/db` (web), `GET /auth/api/health/db` (auth); sign-in redirect to `/auth/{locale}/sign-in`.

## Alternatives

- **Subdomains** (`studio.<domain>`, `console.<domain>`) without `basePath` — separate Vercel projects or services without `/studio` `/console` rewrites; set `STUDIO_APP_URL` / `CONSOLE_APP_URL` accordingly.
- **Auth-only path mount** — ship `web` + `auth` first; drop studio/console rewrites in `vercel.json` if you defer those services.

**Router:** [../README.md](../README.md) · **Health:** [../modules/health-checks.md](../modules/health-checks.md)
