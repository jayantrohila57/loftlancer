# Local Postgres (Better Auth / Drizzle)

From repo root:

```bash
cd infra/db/postgres
docker compose up -d
```

Stop:

```bash
docker compose down
```

Reset data:

```bash
docker compose down -v
```

## Defaults

| Variable            | Default            |
| ------------------- | ------------------ |
| `POSTGRES_USER`     | `postgres`         |
| `POSTGRES_PASSWORD` | `postgres`         |
| `POSTGRES_DB`       | `loftlancer_auth` |
| Host port           | `5432`             |

Copy [`.env.example`](./.env.example) to `.env` here to override (optional).

## Autumn database (same server)

[Autumn OSS](../../autumn/README.md) uses database **`autumn`** on this Postgres instance — not `loftlancer_auth`. Auth and Autumn only share the **server**; connection strings differ.

Create `autumn` once (after Postgres is up):

```bash
./scripts/create-autumn-db.sh
```

Or manually:

```sql
CREATE DATABASE autumn;
```

Autumn migrations: run from `infra/autumn/upstream` (`bun db:generate && bun db:migrate`) with `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/autumn` in `upstream/server/.env`.

## App connection

In each app’s **`.env`** (server), set the same URL if that app should use Postgres or expose DB health:

| App  | File             |
| ---- | ---------------- |
| Auth | `apps/auth/.env` |
| Web  | `apps/web/.env`  |

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/loftlancer_auth
```

Use the **host port** from compose (default `5432`; override with `POSTGRES_PORT` in `infra/db/postgres/.env`). If Postgres is exposed on a non-default host port (see [../../ports.md](../../ports.md)), put that port in every host `DATABASE_URL` (including `…/autumn` for Autumn migrations); `create-autumn-db.sh` still uses `docker compose exec` on the container (not the host port), so no script change is needed for remapped ports.

**Health routes:** [../../../docs/modules/health-checks.md](../../../docs/modules/health-checks.md)

Must match `@packages/t3-env` / Drizzle once wired.

**Requirements:** [../../../docs/work/requirements/better-auth.md](../../../docs/work/requirements/better-auth.md)
