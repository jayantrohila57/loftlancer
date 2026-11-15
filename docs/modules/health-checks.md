# Modules — DB health checks

**Router:** [../AGENTS.md](../AGENTS.md) · Module: `@modules/health`

Readiness probe for Postgres. Shared by **auth** and **web**; logic lives in the module, not in apps.

## HTTP endpoints

| App  | Local URL                                      | Notes                       |
| ---- | ---------------------------------------------- | --------------------------- |
| Auth | `GET http://localhost:3002/auth/api/health/db` | Includes `basePath` `/auth` |
| Web  | `GET http://localhost:3001/api/health/db`      | No `basePath`               |

### Responses

| Status | Body (example)                                               | Meaning                              |
| ------ | ------------------------------------------------------------ | ------------------------------------ |
| `200`  | `{ "ok": true }`                                             | `SELECT 1` succeeded                 |
| `503`  | `{ "ok": false, "error": "DATABASE_URL is not configured" }` | Missing `DATABASE_URL` in app `.env` |
| `503`  | `{ "ok": false, "error": "…" }`                              | DB unreachable or query failed       |

Quick check (Postgres running, `.env` set):

```bash
curl -sS -w '\nHTTP %{http_code}\n' http://localhost:3002/auth/api/health/db
curl -sS -w '\nHTTP %{http_code}\n' http://localhost:3001/api/health/db
```

## Environment

Each app loads **`DATABASE_URL`** from its own **`apps/<app>/.env`** (via `@packages/t3-env/server` and process `cwd`).

Copy from `.env.example`:

| App  | File             |
| ---- | ---------------- |
| Auth | `apps/auth/.env` |
| Web  | `apps/web/.env`  |

Example (match [../../infra/db/postgres/README.md](../../infra/db/postgres/README.md) host port):

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/loftlancer_auth
```

If compose maps a non-default host port (see [infra/ports.md](../../infra/ports.md)), use that port in the URL.

## Architecture

```text
apps/<app>/src/app/api/health/db/route.ts
  → getDbHealthResponse()     compatibility adapter
      → healthRouter.database() → controller → service → repository
          → getDb() + SELECT 1  @packages/drizzle
```

- **Apps:** thin route only — **MUST NOT** duplicate probe logic.
- **`@modules/health`:** the controller validates a `ServiceResponse`; the compatibility adapter preserves `{ ok, error? }` and HTTP status mapping (`200` / `503`). Readiness probes deliberately retain HTTP 503 on failure so infrastructure can detect an unhealthy database.
- **`@packages/drizzle`:** `initDb` / `getDb()` — one pool per Node process; lazy init from `serverEnv.DATABASE_URL`.

Module export:

```typescript
import { getDbHealthResponse } from "@modules/health"

const { body, status } = await getDbHealthResponse()
```

See also: [../../packages/drizzle/AGENTS.md](../../packages/drizzle/AGENTS.md).
