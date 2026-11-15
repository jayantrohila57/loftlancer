# Local development ports

Host ports are fixed so **Next apps** (3001–3004) never compete with **infra** (4001–4004).

## Web apps (Next.js)

| Port | App     | URL (dev)                        |
| ---- | ------- | -------------------------------- |
| 3001 | web     | http://localhost:3001/en-us      |
| 3002 | auth    | http://localhost:3002/auth/en-us |
| 3003 | studio  | http://localhost:3003/en-us      |
| 3004 | console | http://localhost:3004/en-us      |

## Infra (Docker on host)

| Port | Service          | Notes                                 |
| ---- | ---------------- | ------------------------------------- |
| 4001 | Autumn dashboard | `AUTUMN_VITE_PORT` → container `3000` |
| 4002 | Autumn API       | `AUTUMN_API_PORT` → container `8080`  |
| 4003 | Postgres         | `POSTGRES_PORT` → container `5432`    |
| 4004 | Redis            | `REDIS_PORT` → container `6379`       |

**App `DATABASE_URL`:** `postgresql://postgres:postgres@localhost:4003/loftlancer_auth`  
**Autumn compose `DATABASE_URL`:** `postgresql://postgres:postgres@host.docker.internal:4003/autumn`  
**Autumn compose `REDIS_URL`:** `redis://host.docker.internal:4004`  
**Auth `AUTUMN_API_BASE_URL`:** `http://localhost:4002`

After changing host ports, recreate stacks (`pnpm infra-down` then `pnpm infra-up`) and update `infra/autumn/upstream/server/.env` (`CLIENT_URL=http://localhost:4001`, public API URL on **4002**). Re-register Loftlancer OIDC if the API callback port changed (see `infra/autumn/README.md`).
