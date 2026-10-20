# Database schema workflow

## Production (Vercel / Neon)

Production was bootstrapped with **`drizzle-kit push`**, not `drizzle-kit migrate`. The `drizzle.__drizzle_migrations` table may be empty even when the live schema is current.

The production DB client warns when a Neon `DATABASE_URL` does not explicitly
use `sslmode=verify-full`. The runtime still normalizes legacy `require`,
`prefer`, and `verify-ca` values to `verify-full`; use the explicit mode in
deployment settings to keep configuration and driver behavior aligned. The
warning logs only the database hostname and mode, never credentials.

**Owner sign-off:** Jayant approved this path for production (manual `db:push` / reviewed SQL, no migrate on Vercel build). See [docs/PRODUCTION_DEPLOY.md](../../docs/PRODUCTION_DEPLOY.md#database-production-schema-path).

**Do not add `db:migrate` to the deploy pipeline.** After pulling schema changes:

1. Review diffs locally: `pnpm --filter @loftlancer/db db:push` (against a dev/staging database first).
2. Apply to production manually when intentional: run `db:push` with production `DATABASE_URL`, or apply the matching SQL from `src/migrations/` if you prefer explicit scripts (e.g. `0004_organizations.sql`).

One-off data scripts (e.g. `scripts/backfill-personal-orgs.ts`) are run separately; they are not part of Vercel builds.

## Local development

```bash
pnpm --filter @loftlancer/db db:push    # sync schema to DATABASE_URL
pnpm --filter @loftlancer/db db:studio  # browse data
```

`db:generate` / `db:migrate` remain available for teams that use migration journals; this repo’s production source of truth is **push + reviewed SQL** for major releases.

### E2E demo variables (fake / local only)

Playwright login (`E2E_TEST_MODE=1`) calls `ensureE2eDemoProject`, which creates the **E2E Demo Project** / **Development** environment and idempotently seeds encrypted placeholders (`E2E_DEMO_KEY`, `APP_URL`, `LOG_LEVEL`, `DATABASE_URL`, `API_TOKEN`). Notes include the `fake-dev-only` marker; values are obvious samples, not real secrets.

`seedE2eDemoVariables` refuses to run when `VERCEL_ENV=production`, or when `NODE_ENV=production` unless `E2E_TEST_MODE=1` (CI / local `next start` E2E) or `SEED_E2E_DEMO_VARIABLES=yes` (manual opt-in against a non-production database only).

`pnpm db:reset-seed` seeds the same style of fake variables across sample projects (see [docs/DB_RESET.md](../../docs/DB_RESET.md)); it requires `RESET_CONFIRM=yes` separately.

## Reset + seed (production)

When a platform migration intentionally wipes application data but must **keep the owner’s login**:

1. Neon **backup branch** first.
2. Apply combined migration ([docs/PLATFORM_MIGRATION_COMBINED.md](../../docs/PLATFORM_MIGRATION_COMBINED.md)).
3. Run from repo root with explicit env — full procedure in [docs/DB_RESET.md](../../docs/DB_RESET.md):

```bash
RESET_CONFIRM=yes KEEP_USER_EMAIL=owner@example.com DATABASE_URL='…' pnpm db:reset-seed
```

Never run `db:reset-seed` against production default without approval and backup.
