# Console app

Site app on its own port locally (no `basePath`). Production path mount: `/console` via `NEXT_BASE_PATH` — [vercel-deploy.md](./vercel-deploy.md).

|           |                                                                                                                    |
| --------- | ------------------------------------------------------------------------------------------------------------------ |
| Local dev | **`http://localhost:3004/en-us`** — Next prints `Local: http://localhost:3004`; **`/`** redirects to **`/en-us`**. |
| Locales   | `/en-us`, `/en-in`, `/es-es` (`localePrefix: always`)                                                              |
| Web       | **`http://localhost:3001/en-us`**                                                                                  |
| Auth      | **`http://localhost:3002/auth/en-us`**                                                                             |
| Studio    | **`http://localhost:3003/en-us`**                                                                                  |

`pnpm dev` at the repo root starts **console** with **web**, **auth**, and **studio**.

## Environment

Copy `apps/console/.env.example` to `apps/console/.env` and `apps/console/.env.local.example` to `apps/console/.env.local`. Set `NEXT_PUBLIC_AUTH_APP_URL` to the Auth app URL, including its base path. `APP_PUBLIC_URL` must be `http://localhost:3004` when this app is the one running. Include **`DATABASE_URL`** for the DB health route.

## DB health

`GET http://localhost:3004/api/health/db` — `@modules/health`.

Console's home page requires a Better Auth session and an email-verified account in `CONSOLE_ADMIN_EMAILS` (a comma-separated server-only allowlist). An empty allowlist denies everyone. Configure the same `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, and `DATABASE_URL` as the Auth app. Authorization is currently implemented for the existing home page and must also be enforced by future pages and APIs.

## Product analytics

Console intentionally **does not** load PostHog. It is an operator surface; product analytics and account consent (`@modules/privacy`) apply on **Auth** and **Studio** only. Vercel Web Analytics / Speed Insights still load via `@packages/analytics` when enabled on the deployment.
