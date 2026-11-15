# Auth app

Path-mounted on the shared domain (not site root).

| Setting       | Value                                                                                                                                   |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `basePath`    | `/auth` — [`auth.config.ts`](./auth.config.ts), [`next.config.ts`](./next.config.ts)                                                    |
| Local dev     | **`http://localhost:3002/auth/en-us`** — Next prints `Local: http://localhost:3002`; the app lives under **`/auth`**, not at port root. |
| Port root `/` | Redirects to **`/auth/en-us`** (`redirects` in `next.config.ts`).                                                                       |
| Dev logs      | `GET /en-in` is the path **after** stripping `basePath`; the browser bar should show **`/auth/en-in`**.                                 |
| Route group   | `src/app/[lang]/(auth)/`                                                                                                                |
| Proxy matcher | `["/", "/(en-us\|en-in\|es-es)/:path*"]` — relative to `basePath`                                                                       |

**Web** stays at `/` with no `basePath`. Production single-domain routing: [vercel-deploy.md](./vercel-deploy.md).

## Environment

Validated with **T3 Env** in [`@packages/t3-env`](../../packages/t3-env/AGENTS.md). **Do not** read `process.env` outside that package.

| File (under `apps/auth/`)             | Purpose                                                      |
| ------------------------------------- | ------------------------------------------------------------ |
| `.env`                                | Server-only (`DATABASE_URL`, `BETTER_AUTH_*`, OAuth, Resend) |
| `.env.local`                          | Client-only (`NEXT_PUBLIC_*`)                                |
| `.env.example` / `.env.local.example` | Copy to create the gitignored files                          |

Imports: `@/shared/config/auth.server-env` · `@/shared/config/auth.client-env` (re-export `@packages/t3-env`).

## DB health

`GET http://localhost:3002/auth/api/health/db` — delegates to `@modules/health`. Requires `DATABASE_URL` in `.env` and local Postgres ([../../infra/db/postgres/README.md](../../infra/db/postgres/README.md)). Details: [../modules/health-checks.md](../modules/health-checks.md).

## Better Auth (v1)

| Item       | Location                                                                         |
| ---------- | -------------------------------------------------------------------------------- |
| Server     | `@packages/better-auth` — `getAuth()`, Drizzle adapter, Google/GitHub/magic link |
| API        | `GET/POST http://localhost:3002/auth/api/auth/*` — `createAuthRouteHandlers()`   |
| Sign-in UI | `@modules/auth` → `/auth/{locale}/sign-in` (and auth home `/auth/{locale}`)      |
| Stubs      | `/auth/{locale}/welcome`, `/auth/{locale}/first-login`                           |

Env: `BETTER_AUTH_SECRET` (32+ chars), `BETTER_AUTH_URL=http://localhost:3002/auth`, OAuth vars optional, `RESEND_API_KEY` for production magic link (dev logs link to terminal).

**GitHub OAuth App** ([Developer settings → OAuth Apps](https://github.com/settings/developers)) — **Authorization callback URL** must match exactly (one character off → “redirect_uri is not associated”):

```text
http://localhost:3002/auth/api/auth/callback/github
```

Use `localhost`, not `127.0.0.1`, unless you register that URL too. `BETTER_AUTH_URL` in `.env` must stay `http://localhost:3002/auth` so server and client agree on the callback.

Smoke: `curl -sS http://localhost:3002/auth/api/auth/ok`

Schema: `pnpm --filter @packages/drizzle db:push` after `npx auth@latest generate --config packages/better-auth/better-auth.config.ts`.

## Optional dev routes (platform)

| Route                        | When                                                                                                                                                                                   |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET/POST …/api/sentry-test` | `SENTRY_TEST_TOKEN` (≥32 chars) in `.env`; header `x-sentry-test-token`. Auth: `http://localhost:3002/auth/api/sentry-test`                                                            |
| `POST …/api/mcp`             | Better Auth MCP OAuth + JWT gate (`@packages/mcp/server`). Default registrar is empty until domain tools are approved. Resource URL: `MCP_RESOURCE_URL` or `{BETTER_AUTH_URL}/api/mcp` |

Same Sentry test path exists on web, studio, and console at each app’s port (no `/auth` prefix on those apps).

Auth accepts post-sign-in `returnTo` destinations only under the configured `STUDIO_APP_URL`, `CONSOLE_APP_URL`, or Auth application roots. Configure the public app URLs explicitly for each deployment. OAuth and magic-link callbacks go through the authenticated `/auth/{locale}/continue` page before redirecting. Without `returnTo`, first-time users (one persisted session row) go to `/auth/{locale}/welcome`; returning users go to Studio home. Local Studio and Console currently run on their own ports; production path mounting and sign-out routing are not yet wired.
