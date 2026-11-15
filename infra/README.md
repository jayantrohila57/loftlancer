# Infra (repo root)

Local infrastructure for development and deployment helpers.

**Port plan:** [ports.md](./ports.md) — Next apps **3001–3004**, infra **4001–4004**.

**Container runtime:** default **Podman** (`scripts/infra/runtime.env`). From repo root:

```bash
pnpm infra-up      # Postgres → autumn DB → Redis → Autumn
pnpm infra-status
pnpm infra-down
```

Set `CONTAINER_RUNTIME=docker` in `scripts/infra/runtime.env` to use Docker instead. Compose files are unchanged; only the CLI differs.

| Path                                                  | Purpose                                                 |
| ----------------------------------------------------- | ------------------------------------------------------- |
| [autumn/](./autumn/)                                  | Self-hosted Autumn OSS (local dev)                      |
| [db/postgres/](./db/postgres/)                        | Docker Postgres for auth / Drizzle (+ `autumn` DB)      |
| [redis/](./redis/)                                    | Shared Redis (host **4004**) for Autumn and future apps |
| [../packages/drizzle/](../packages/drizzle/AGENTS.md) | `@packages/drizzle` ORM + kit scripts                   |

Production DB: **Neon** later (same `DATABASE_URL` shape in app env).

Spec: [docs/work/requirements/better-auth.md](../docs/work/requirements/better-auth.md)

## Local dev stack order (auth + Autumn)

From repo root:

```bash
# 1) Shared Postgres (auth DB + create autumn database)
cd infra/db/postgres && docker compose up -d
./scripts/create-autumn-db.sh

# 2) Shared Redis
cd ../../redis && docker compose up -d

# 3) One-time: clone Autumn upstream + migrate (see infra/autumn/README.md)
cd ../autumn
# git clone … upstream, bun install/setup, db:migrate against DATABASE_URL …/autumn

# 4) Autumn API + dashboard (no bundled Postgres/Redis)
docker compose -f docker-compose.autumn.yml up --build

# 5) Auth app
cd ../../.. && pnpm --filter auth dev
```

Auth env: `AUTUMN_API_BASE_URL=http://localhost:4002`. Stripe and Autumn server secrets stay in **Autumn `upstream/server/.env`**, not `apps/auth/.env` (except `AUTUMN_SECRET_KEY`).

## Redis (shared)

```bash
cd infra/redis
docker compose up -d
```

| Variable     | Default |
| ------------ | ------- |
| `REDIS_PORT` | `4004`  |

Image: `redis:7-alpine` with AOF persistence. Autumn upstream uses `REDIS_URL` (default host in this repo: `redis://host.docker.internal:4004`); see [autumn/.env.example](./autumn/.env.example).

Copy [redis/.env.example](./redis/.env.example) to `redis/.env` to override the host port (optional).
