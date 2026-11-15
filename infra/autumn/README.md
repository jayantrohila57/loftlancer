# Self-hosted Autumn OSS (local dev)

Run [Autumn](https://github.com/useautumn/autumn) on your machine — **not** Autumn cloud (`api.useautumn.com`). Stripe keys belong in **Autumn `server/.env` only**; `apps/auth` talks to Autumn via `AUTUMN_API_BASE_URL` + `AUTUMN_SECRET_KEY` (unchanged).

Requirements spec: [docs/work/requirements/autumn-usage-metering.md](../../docs/work/requirements/autumn-usage-metering.md)

## Ports (this repo’s default layout)

Canonical map: [../ports.md](../ports.md). **Web apps use 3001–3004; infra uses 4001–4004.**

| Service                | URL / port              | Notes                                                                                                |
| ---------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------- |
| **API** (plugin + SDK) | `http://localhost:4002` | `AUTUMN_API_BASE_URL` in `apps/auth/.env`                                                            |
| Dashboard (Vite)       | `http://localhost:4001` | API keys (`am_sk_…`), Stripe connect                                                                 |
| Shared Postgres        | `localhost:4003`        | Auth: `loftlancer_auth`; Autumn: **`autumn`** — [../db/postgres/README.md](../db/postgres/README.md) |
| Shared Redis           | `localhost:4004`        | [../redis/docker-compose.yml](../redis/docker-compose.yml)                                           |

**Health:** `curl http://localhost:4002/` (not `/health`).

There is **no published single-container Autumn image**. The local stack builds `server`, `vite`, and `workers` from `docker/dev.dockerfile` in the cloned repo, without bundled Valkey/Postgres. The current upstream shared package exports TypeScript directly and has no `dev` script; it is included in the images rather than run as a separate service. Rebuild the images after changing upstream shared code. Vite's temporary configuration files use a named volume to avoid host bind-mount permission errors.

The local compose stack also runs ElasticMQ for Autumn's SQS jobs. Its queues are in memory and are intended for local development only; restarting the queue loses pending jobs. Redis remains the cache and is not a substitute for the SQS queue required by the current upstream version.

## Upstream env vars (Postgres / Redis)

From Autumn `server/.env.example` (public OSS tree):

| Variable                | Purpose                                                             |
| ----------------------- | ------------------------------------------------------------------- |
| `DATABASE_URL`          | Postgres connection string (database name **`autumn`**)             |
| `CRITICAL_DATABASE_URL` | Optional secondary DB (leave empty unless upstream docs require it) |
| `REDIS_URL`             | Redis/Valkey URL; default `redis://localhost:4004` on host          |

In **`docker-compose.autumn.yml`**, compose sets `DATABASE_URL` and `REDIS_URL` on the **server** service and `REDIS_URL` on **workers**. Both server and workers use `QUEUE_URL`, defaulting to Redis database 1 (`redis://host.docker.internal:4004/1`) for the local BullMQ queue. Override with `AUTUMN_QUEUE_URL` in `infra/autumn/.env`. Other secrets (Stripe, `BETTER_AUTH_*`, encryption, etc.) still come from `upstream/server/.env` after `bun setup`.

## Option D — shared Postgres + shared Redis + Autumn in Docker (**recommended**)

No Autumn-owned Postgres (4003) and no Valkey service in this path.

### One-time setup

1. **Clone upstream** (gitignored):

   ```bash
   git clone https://github.com/useautumn/autumn.git infra/autumn/upstream
   cd infra/autumn/upstream
   bun install
   bun run setup
   ```

   If `https://github.com/useautumn/autumn` returns **404**, clone an accessible fork into the same path. `infra/autumn/upstream/` is gitignored — **do not commit** it.

2. **Point Autumn at shared Postgres** in `infra/autumn/upstream/server/.env`:

   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/autumn
   REDIS_URL=redis://localhost:4004
   ```

3. **Migrations** (from `upstream`, against host Postgres):

   ```bash
   bun run db:generate && bun run db:migrate
   ```

4. Optional: copy [`.env.example`](./.env.example) to `infra/autumn/.env` if you need non-default ports or credentials. When shared Postgres uses **`POSTGRES_PORT=4003`** ([../db/postgres/.env](../db/postgres/.env)), set `DATABASE_URL=...@host.docker.internal:4003/autumn` in `infra/autumn/.env` (not `5432`).
   For **legacy** dedicated Postgres on host **4003** (`docker-compose.yml`), point containers at the host:

   ```env
   DATABASE_URL=postgresql://postgres:postgres@host.docker.internal:4003/autumn
   REDIS_URL=redis://host.docker.internal:4004
   ```

### Dev session — exact compose order

From **repo root**:

```bash
# 1) Shared Postgres
cd infra/db/postgres && docker compose up -d

# 2) Create Autumn database (once per volume)
./scripts/create-autumn-db.sh

# 3) Shared Redis
cd ../../redis && docker compose up -d

# 4) Autumn (API :4002, dashboard :4001) — builds from upstream/, no PG/Redis containers
#    Uses compose project `loftlancer-autumn-dev` and containers `fk-autumn-*`.
cd ../autumn && docker compose --env-file .env -f docker-compose.autumn.yml up --build -d

# 5) Auth app (separate terminal)
cd ../../.. && pnpm --filter auth dev
```

`apps/auth/.env`:

```env
AUTUMN_API_BASE_URL=http://localhost:4002
AUTUMN_SECRET_KEY=am_sk_...   # dashboard http://localhost:4001 → API keys
# Optional: match plan ids from Autumn dashboard (defaults: free / paid)
# AUTUMN_PLAN_ID_FREE=free
# AUTUMN_PLAN_ID_PAID=paid
# Webhook (register in self-hosted dashboard): POST {BETTER_AUTH_URL origin}/api/billing/webhook
# AUTUMN_WEBHOOK_SECRET=...
# Pin API version when OSS lags autumn-js (default SDK header is 2.6.0):
# AUTUMN_X_API_VERSION=2.3.0
```

**`AUTUMN_SECRET_KEY`:** create/copy `am_sk_…` in the dashboard on **:4001** (or `AUTUMN_VITE_PORT` if **:4001** is taken by another app). Dashboard sign-in is **SSO only** via Loftlancer Auth (`:3002`) — not Autumn email OTP or Google.

### How Option D differs from upstream `docker compose -f docker-compose.unix.yml up`

Upstream compose starts **Valkey** on `6379` and expects `REDIS_URL=redis://valkey:6379`. This repo’s [docker-compose.autumn.yml](./docker-compose.autumn.yml) omits Valkey/Postgres and uses `host.docker.internal` (Linux: `extra_hosts: host-gateway`) for [../db/postgres](../db/postgres) and [../redis](../redis).

## Other options (legacy / upstream-only)

| Option                        | When to use                                                                                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **A — Upstream full compose** | Inside `upstream`: `docker compose -f docker-compose.unix.yml up` — bundles Valkey; uses Postgres from your `server/.env` (not the 4003 helper). |
| **B — Legacy 4003 Postgres**  | [docker-compose.yml](./docker-compose.yml) — **deprecated**; dedicated Autumn Postgres on host **4003** only.                                    |
| **C — Agent bootstrap**       | `bun agent:bootstrap` / `bun dev:agent` in `upstream` — no Docker for Autumn; still use shared `DATABASE_URL` / `REDIS_URL` on the host.         |

## Stripe (Autumn server only)

Configure Stripe **test** keys in **`infra/autumn/upstream/server/.env`**. Do **not** put Stripe secrets in `apps/auth/.env`. Connect Stripe in the dashboard for checkout.

## Environment cheat sheet

| Where                | Variable               | Purpose                                                 |
| -------------------- | ---------------------- | ------------------------------------------------------- |
| Autumn `server/.env` | `DATABASE_URL`         | `…/autumn` on shared Postgres                           |
| Autumn `server/.env` | `REDIS_URL`            | `redis://localhost:4004` (host) or via compose override |
| Autumn `server/.env` | Stripe, Resend, Google | Payments / dashboard login                              |
| `apps/auth/.env`     | `AUTUMN_API_BASE_URL`  | Self-hosted API origin (no trailing path)               |
| `apps/auth/.env`     | `AUTUMN_SECRET_KEY`    | From local dashboard                                    |
| `apps/auth/.env`     | `DATABASE_URL`         | **`loftlancer_auth` only**                              |

`autumn-js` defaults to **`https://api.useautumn.com`** when `baseURL` is omitted — always set `AUTUMN_API_BASE_URL` for self-host.

## Troubleshooting

- **`upstream/` missing**: clone step above; compose build `context` is `./upstream`.
- **Redis connection refused in containers**: ensure `infra/redis` is up; check `REDIS_URL` in compose defaults.
- **DB does not exist**: run [../db/postgres/scripts/create-autumn-db.sh](../db/postgres/scripts/create-autumn-db.sh) and migrations in `upstream`.
- **Port 4004 / 4003 in use**: stop conflicting stacks; do not run upstream `docker-compose.unix.yml` Valkey alongside `infra/redis`.
- **Plugin hits cloud**: confirm `@packages/better-auth` uses `AUTUMN_API_BASE_URL` and restart auth dev.
- **`preload not found ../scripts/preload-env.ts`**: upstream `server/bunfig.toml` preloads `../scripts/preload-env.ts`; [docker-compose.autumn.yml](./docker-compose.autumn.yml) mounts `./upstream/scripts` → `/app/scripts` on **server** and **workers**.
- **`cross-env: command not found` / missing deps in containers**: do **not** mount empty `node_modules` volumes over the image; the compose file uses image `node_modules` only (source bind-mounts for live reload).
- **Stale Autumn DB schema** (e.g. `customer_license_link_id`, `pooled_balance_contributions`): recreate DB and bootstrap migrations:

  ```bash
  # From repo root; Postgres on host 4003 per infra/db/postgres/.env
  PGPASSWORD=postgres psql -h 127.0.0.1 -p 4003 -U postgres -c \
    "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='autumn' AND pid <> pg_backend_pid();"
  PGPASSWORD=postgres psql -h 127.0.0.1 -p 4003 -U postgres -c "DROP DATABASE IF EXISTS autumn; CREATE DATABASE autumn;"
  PGPASSWORD=postgres psql -h 127.0.0.1 -p 4003 -U postgres -d autumn -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;"
  cd infra/autumn/upstream && AUTUMN_DB_DIRECT=1 \
    DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:4003/autumn \
    bun scripts/db/index.ts migrate --bootstrap
  docker restart fk-autumn-server fk-autumn-workers
  ```

  After a reset, open **http://localhost:4001**, sign in (Loftlancer auth on **:3002**), create an org, add **`free`** / **`paid`** products (ids must match `AUTUMN_PLAN_ID_*` or defaults), create an **API key**, and copy `am_sk_…` into `apps/auth/.env` as `AUTUMN_SECRET_KEY`. **Restart auth** (`systemctl --user restart loftlancer-auth.service` or `pnpm --filter auth dev`).

- **Org not bound** (`autumn_customer_id` null, `billing.customer_unbound`): billing routes need a row in `org_entitlement` **and** a successful Autumn bind. Re-bind after API key + products exist by loading billing as owner (provisioning repair) **or** creating a new org (bind runs on create). To repair the active org manually, from repo root with `apps/auth/.env` loaded:

  ```bash
  pnpm exec tsx -e "
    import { config } from 'dotenv';
    config({ path: 'apps/auth/.env' });
    const { bindOrganizationAutumnCustomer } = await import('./packages/billing/src/integration/billing.customer-bind.ts');
    const orgId = process.argv[1] ?? 'YOUR_ORG_ID';
    const r = await bindOrganizationAutumnCustomer({ organizationId: orgId });
    console.log(r);
  " CYgiN0N3WRHo8bmIfXhhLYklWRbfAUuC
  ```

  Replace the org id with `SELECT organization_id FROM org_entitlement;` from `loftlancer_auth`.
- **Legacy 4003 Postgres**: only if you cannot share `infra/db/postgres`; see deprecated [docker-compose.yml](./docker-compose.yml).
## Loftlancer SSO only (local dashboard)

The Autumn dashboard at `http://localhost:4001` has **no separate Autumn login**. **Continue with SSO** sends you through Loftlancer Auth (`http://localhost:3002`) as the OIDC provider, then back to the dashboard callback on the Autumn API (`BETTER_AUTH_URL`, default `http://localhost:4002`). Email/password, email OTP, and Google are disabled in `overrides/server/auth.ts`; the Vite overrides replace `SignIn.tsx` and `auth-client.ts` (copied into the container on `vite` startup — see `docker-compose.autumn.yml`).

The local server override only accepts the verified `jrohila55@gmail.com` identity from userinfo. The OAuth client is first-party and skips consent; PKCE and the registered callback `http://localhost:4002/api/auth/oauth2/callback/loftlancer` are required. Autumn still stores its own user, session, and org rows after SSO.

1. Start the Loftlancer auth app on `localhost:3002` and shared Postgres.
2. Run `python3 infra/autumn/scripts/register-loftlancer-oidc.py` once (writes `LOFTLANCER_OIDC_*` to gitignored `infra/autumn/.env`).
3. Ensure `upstream/server/.env` has `BETTER_AUTH_URL=http://localhost:4002` and `CLIENT_URL=http://localhost:4001`.
4. Start Autumn compose and use **Continue with SSO** at `http://localhost:4001`.

The server and UI overrides in `overrides/` are mounted over the upstream checkout; review them against upstream commit `6a618b67a4c54942745c59a67c047fd3b2c5a189` before upgrading. Addresses and the account allowlist are local-development configuration and must be redesigned for a production deployment. The source database, local OAuth client, and `.env` must be backed up together. Registering the client does not complete Stripe configuration. The local BullMQ workers use Redis database 1; verify the worker logs show ready after startup.

Existing Autumn sessions created before this override are not automatically revoked. Do not enable this configuration on a deployment with existing untrusted sessions without invalidating them and auditing its accounts first.

## Start at machine boot

On this machine, Docker is enabled at boot and the PostgreSQL, Redis, and Autumn containers (`fk-autumn-*`) use `restart: unless-stopped`. The user service `loftlancer-auth.service` is enabled so Loftlancer's auth development server also starts for Autumn SSO. User lingering is enabled. The service waits for PostgreSQL health and for port 3002 to become free, so an already running auth server is not interrupted.

```bash
systemctl --user status loftlancer-auth.service
journalctl --user -u loftlancer-auth.service -f
systemctl --user restart loftlancer-auth.service
```

The installed unit lives at `~/.config/systemd/user/loftlancer-auth.service`; its template and startup script live in `infra/autumn/systemd/`. It records this checkout and the current `pnpm` path. Update the unit and run `systemctl --user daemon-reload` if either moves. This is a development startup arrangement, not a production deployment. Containers intentionally stopped with Docker will not restart until started again.
