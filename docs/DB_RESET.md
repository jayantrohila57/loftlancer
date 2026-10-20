# Database reset and sample seed

Use this workflow when applying the combined platform migration (`0007`) to **production**: keep the owner’s GitHub login, wipe application data, then load realistic **fake** sample data for demos and QA.

**Policy:** On intentional prod schema change, use **Neon backup first**, one **combined migration** approved by the owner, then optional reset-seed keeping the owner account (`KEEP_USER_EMAIL`). See [PLATFORM_MIGRATION_COMBINED.md](./PLATFORM_MIGRATION_COMBINED.md) and [AGENTS.md](../AGENTS.md).

**Never run `db:reset-seed` against the production Neon default branch until you intend to wipe prod data.** Always validate on a Neon branch first.

For local development, run `pnpm db:reset-seed` only against a disposable local
database. The command requires both `RESET_CONFIRM=yes` and
`KEEP_USER_EMAIL=<owner-email>`, verifies that the owner exists before purge,
and preserves that user's account and login rows. Use `pnpm db:check-schema` to
detect changes since the last successful local reset-seed. Never point it at
production unless the separate backup, migration, and owner approval procedure
below explicitly calls for it.

Run `pnpm db:check-schema` after applying schema changes locally. It compares the
current Drizzle schema files with a local fingerprint. The first check records a
baseline without changing data. Later checks offer the guarded reset-seed command
when the schema differs; a successful reset-seed records the new fingerprint.
The check never resets data. The fingerprint file is local and ignored by Git.

## Prerequisites

- `RESET_CONFIRM=yes` and `KEEP_USER_EMAIL` set to the owner account that must keep Better Auth `user`, `account`, `session`, and `verification` rows.
- `DATABASE_URL` pointing at the target database (branch or production).
- App env vars required by `@loftlancer/env` (`ENCRYPTION_KEY`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `CORS_ORIGIN`) or `SKIP_ENV_VALIDATION=1` for scripted runs with only `DATABASE_URL` + crypto key.
- Schema at or beyond `packages/db/src/migrations/0007_platform_combined_for_prod.sql` (run migration SQL or `pnpm --filter @loftlancer/db db:push` on the target).

## Recommended production workflow

1. **Backup branch** — In Neon, create a branch from the current default (e.g. `backup-before-platform-YYYY-MM-DD`).
2. **Migrate** — Apply `0007_platform_combined_for_prod.sql` on the target (or `db:push` after review). See [PLATFORM_MIGRATION_COMBINED.md](./PLATFORM_MIGRATION_COMBINED.md).
3. **Enable feature flags** (after migration):

   ```env
   VARIABLES_V2_ENABLED=true
   NOTIFICATIONS_ENABLED=true
   ACTIONS_AUDIT_ENABLED=true
   SOFT_DELETES_ENABLED=true
   NEXT_PUBLIC_VARIABLES_V2_ENABLED=true
   NEXT_PUBLIC_NOTIFICATIONS_ENABLED=true
   NEXT_PUBLIC_ACTIONS_AUDIT_ENABLED=true
   ```

4. **Reset + seed** — From the repo root:

   ```bash
   RESET_CONFIRM=yes \
   KEEP_USER_EMAIL=owner@example.com \
   DATABASE_URL='postgresql://...' \
   pnpm db:reset-seed
   ```

## What the script does

1. **Refuses** to run unless `RESET_CONFIRM=yes` and `KEEP_USER_EMAIL` is set.
2. **Truncates** application tables (organizations, projects, environments, variables, teams, grants, notifications, audit, blocks, invitations, etc.).
3. **Deletes** all users except the kept owner (cascades other users’ sessions/accounts) and removes `verification` rows not tied to the owner email.
4. **Seeds** fake data: personal + team orgs for the owner, 15 sample projects, 2–3 environments each, mixed `secret` / `config` variables (encrypted placeholders, not real secrets), sample manager/member teammates, teams, project grants, notifications, and audit rows. Re-running is **idempotent** (full purge then seed again).

## Neon branch test (required before prod)

1. Branch from a migrated parent (e.g. `cursor-migration-test-combined`).
2. Point `DATABASE_URL` at the branch connection string.
3. Run `pnpm db:reset-seed` twice; confirm counts stable and the owner can still sign in.

## Related

- [DATABASE.md](../packages/db/DATABASE.md) — schema sync and migrations
- [PLATFORM_MIGRATION_COMBINED.md](./PLATFORM_MIGRATION_COMBINED.md) — `0007` bundle
