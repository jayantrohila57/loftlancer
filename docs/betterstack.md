# Better Stack uptime and Loftlancer status page

Loftlancer serves a first-party status experience at **`/status`** (web app). Monitor data is sourced from the [Better Stack Uptime API](https://betterstack.com/docs/uptime/api/getting-started-with-uptime-api/) with a public JSON fallback (`https://loftlancer.betteruptime.com/index.json`).

## Environment variables (Vercel **web** service)

| Variable | Required | Description |
| --- | --- | --- |
| `BETTERSTACK_API_TOKEN` | Recommended | Better Stack **Incidents API** bearer token ([team tokens](https://betterstack.com/settings/api-tokens/0)). Powers incidents/history and authenticated resource refresh. |
| `BETTERSTACK_STATUS_PAGE_ID` | Optional | Status page id (default `267755` for `loftlancer.betteruptime.com`). |

Declared in `@packages/t3-env/server` and `apps/web/.env.example`.

## Status page groups (UI mapping)

Group assignment is configured in `apps/web/src/shared/status/web-betterstack-monitor-groups.config.ts`. Default groups:

| Group | Typical monitor names |
| --- | --- |
| Website | `loftlancer.com`, apex marketing routes |
| Auth | `/auth`, sign-in surfaces |
| Studio | `/studio` |
| Console | `/console` |
| API | `/api`, docs, GraphQL/oRPC routes |

Edit regex rules when Better Stack `public_name` values change.

## Monitors to configure in Better Stack

Create **HTTP** monitors pointed at production URLs on `loftlancer.com` (Vercel Services). Use **multi-region** checks where your plan allows; on Hobby, prefer the default regions Better Stack provides for HTTP monitors.

| Monitor name (public) | URL | Check type | Expected | Interval | Regions |
| --- | --- | --- | --- | --- | --- |
| Website home | `https://loftlancer.com/api/health` | HTTP | `200`, JSON `"ok": true` | 3 min | EU + US (or all available) |
| Auth | `https://loftlancer.com/auth/api/health` | HTTP | `200`, `"service": "auth"` | 3 min | EU + US |
| Studio | `https://loftlancer.com/studio/api/health` | HTTP | `200`, `"service": "studio"` | 3 min | EU + US |
| Console | `https://loftlancer.com/console/api/health` | HTTP | `200`, `"service": "console"` | 3 min | EU + US |
| API / DB readiness | `https://loftlancer.com/api/health/db` | HTTP | `200`, `"ok": true` when DB healthy | 3 min | EU + US |

Attach each monitor to status page **267755** (or your replacement page) in the section layout that matches the UI groups above.

### App health endpoints (repo)

Each app exposes a cheap JSON probe:

- Web: `GET /api/health` (+ existing `GET /api/health/db`)
- Auth: `GET /auth/api/health` (+ `GET /auth/api/health/db`)
- Studio: `GET /studio/api/health` (+ `GET /studio/api/health/db`)
- Console: `GET /console/api/health` (+ `GET /console/api/health/db`)

When `DATABASE_URL` is set for an app, `/api/health` includes a `checks.database` block; failures return HTTP `503`.

## Better Stack account steps (manual)

1. Create or reuse the Loftlancer status page (`loftlancer.betteruptime.com`, id `267755`).
2. Add/rename monitors per the table above; wire them to the status page resources.
3. Issue an **Incidents API** token for the Loftlancer team and set `BETTERSTACK_API_TOKEN` on the **web** Vercel service.
4. (Optional) Set `BETTERSTACK_STATUS_PAGE_ID` if you migrate off page `267755`.
5. Hide or unpublish the hosted Better Stack page once `https://loftlancer.com/status` is live, or redirect the custom subdomain to `/status`.

## Related docs

- [modules/health-checks.md](./modules/health-checks.md)
- [apps/vercel-deploy.md](./apps/vercel-deploy.md)