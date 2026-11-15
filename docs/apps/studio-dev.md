# Studio app

Site app on its own port locally (no `basePath`). Production path mount: `/studio` via `NEXT_BASE_PATH` — [vercel-deploy.md](./vercel-deploy.md).

|           |                                                                                                                    |
| --------- | ------------------------------------------------------------------------------------------------------------------ |
| Local dev | **`http://localhost:3003/en-us`** — Next prints `Local: http://localhost:3003`; **`/`** redirects to **`/en-us`**. |
| Locales   | `/en-us`, `/en-in`, `/es-es` (`localePrefix: always`)                                                              |
| Web       | **`http://localhost:3001/en-us`**                                                                                  |
| Auth      | **`http://localhost:3002/auth/en-us`**                                                                             |

`pnpm dev` at the repo root starts **studio** with **web**, **auth**, and **console**.

## Environment

Copy `apps/studio/.env.example` to `apps/studio/.env` and `apps/studio/.env.local.example` to `apps/studio/.env.local`. Set `NEXT_PUBLIC_AUTH_APP_URL` to the Auth app URL, including its base path. `APP_PUBLIC_URL` must be `http://localhost:3003` when this app is the one running. Include **`DATABASE_URL`** for the DB health route.

## DB health

`GET http://localhost:3003/api/health/db` — `@modules/health`.

Studio's home page requires a verified Better Auth session. Configure the same `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, and `DATABASE_URL` as the auth app. Signed-out visitors are sent to Auth with a return destination; organization membership is not implemented yet.

## PWA

Studio ships installable PWA metadata for the default locale (`/en-us`).

| Asset / route                                | Location                                                    |
| -------------------------------------------- | ----------------------------------------------------------- |
| Manifest source (icons, screenshots, colors) | `apps/studio/src/shared/config/studio.pwa.manifest.json`    |
| Next manifest route                          | `apps/studio/src/app/manifest.ts` → `/manifest.webmanifest` |
| Static manifest + icons                      | `apps/studio/public/favicon/` (`site.webmanifest`, PNGs)    |

**Regenerate icons and placeholder screenshots** (requires `sharp` on the studio package):

```bash
pnpm --filter studio generate:pwa-assets
```

**Verify manifest paths and PNG dimensions** (optional; not part of default `pnpm check`):

```bash
node --test scripts/pwa/pwa-manifest.test.mjs
```

Real dashboard screenshots: `pnpm --filter studio capture:pwa-screenshots` is reserved until Studio Playwright e2e exists; until then the generator writes placeholders.

In dev, open `http://localhost:3003/manifest.webmanifest` and `http://localhost:3003/favicon/site.webmanifest` after `pnpm --filter studio dev`.

**Production (Vercel Services):** when `NEXT_BASE_PATH=/studio`, `manifest.ts` and layout metadata prefix icon/manifest URLs via `studio.pwa.paths.ts` (`start_url` becomes `/studio/en-us`).
