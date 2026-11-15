# Module `health`

Ops / readiness checks (DB, future deps). **Docs:** [../../docs/modules/health-checks.md](../../docs/modules/health-checks.md) · [../../docs/modules/api-structure.md](../../docs/modules/api-structure.md)

| Layer  | Path          |
| ------ | ------------- |
| API    | `src/api/`    |
| Domain | `src/domain/` |

Apps **delegate** HTTP routes to `getDbHealthResponse()` — **MUST NOT** duplicate check logic in `apps/`.

Uses `@packages/drizzle` **`getDb()`** (global client from app `.env` `DATABASE_URL`).
