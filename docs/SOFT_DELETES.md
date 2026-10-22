# Soft deletes (app-wide)

User-facing deletes set `deleted_at` and `deleted_by` instead of removing rows. Reads exclude soft-deleted rows by default.

## Schema

Drizzle tables that support soft delete expose nullable:

- `deleted_at` (`timestamp`)
- `deleted_by` (`text`, FK → `user.id`, `ON DELETE SET NULL`)

Applied in schema for: `project`, `environment`, `environment_variable`, `organization`, `member`, `invitation`, and `notification`. Account deletion also soft-deletes the `user` row and replaces the name, email, and image with anonymized values.

**Exceptions (hard delete only):** `session`, `account`, `verification`, and immutable `audit_log`.

Global unique constraints on slugs/emails are replaced with **partial unique indexes** `WHERE deleted_at IS NULL` so active rows stay unique while deleted rows retain history.

The **combined SQL migration** is the approved prod vehicle (see `docs/ACTIONS_PERMISSIONS_AUDIT.md` §9.8 and `docs/PLATFORM_MIGRATION_COMBINED.md`). Do not apply ad-hoc `db:generate` / `db:migrate` on production without the same review process as `0007`.

## Feature flag

```env
SOFT_DELETES_ENABLED=true
```

Default is **off**. When off:

- Queries do not reference `deleted_at` (production stays compatible pre-migration).
- Delete mutations perform **hard** `DELETE` (current behavior).

When on (after migration):

- `notDeleted()` / `active*Where()` helpers add `deleted_at IS NULL`.
- Delete mutations call `softDelete*ById` helpers (cascade soft-delete for project → environments → variables).

## Code helpers (`@loftlancer/db`)

| Helper | Purpose |
|--------|---------|
| `notDeleted(column)` | `IS NULL` filter when flag on |
| `activeProjectWhere`, `activeEnvironmentWhere`, … | Scope queries to active rows |
| `environmentOwnedByUserWhere`, `variableOwnedByUserWhere` | Join-aware access checks |
| `softDeleteProjectById`, `softDeleteEnvironmentById`, `softDeleteEnvironmentVariableById` | User-facing deletes |

## Better Auth

Organization/member/invitation deletes initiated via Better Auth still use the adapter’s hard delete until the auth workstream wires soft-delete hooks. App-owned tRPC deletes and all list/get paths already respect the flag.

## Account deletion

The account settings action anonymizes the user name, email, and image, marks the user row as deleted, and removes active sessions. Organization/project data and audit history remain. There is currently no automatic deletion date configured for those records. The anonymized profile cannot be restored by the user; sign-in attempts for a deleted user are rejected.

## Enabling in production

1. Apply the combined migration (adds columns + partial indexes).
2. Set `SOFT_DELETES_ENABLED=true` on the API/runtime.
3. Smoke-test project/environment/variable delete and list flows.
