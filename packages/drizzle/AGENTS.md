# Package `drizzle`

Postgres via **Drizzle ORM**. Folder **`drizzle`** → **`@packages/drizzle`**.

| Command (from repo root)                      | Action                  |
| --------------------------------------------- | ----------------------- |
| `pnpm --filter @packages/drizzle db:push`     | Push schema to local DB |
| `pnpm --filter @packages/drizzle db:generate` | SQL migrations          |
| `pnpm --filter @packages/drizzle db:migrate`  | Apply migrations        |
| `pnpm --filter @packages/drizzle db:studio`   | Drizzle Studio          |

Loads **`apps/auth/.env`** for `DATABASE_URL` when running kit commands (via `config/drizzle.load-auth-env.ts` + `@packages/t3-env/server`).

## Global client

One pool per Node process (`globalThis`), lazily created from **`serverEnv.DATABASE_URL`** (app `.env` via cwd):

```typescript
import { getDb, initDb } from "@packages/drizzle"
import { sql } from "drizzle-orm"

const db = getDb()
// or eager: initDb({ databaseUrl: serverEnv.DATABASE_URL! })
```

**MUST NOT** read raw `process.env` here — use `@packages/t3-env/server` or pass `databaseUrl` to `initDb`.

Modules and apps **import `getDb()`** — do not create per-app `shared/db` wrappers unless an app needs a second database.

**Schema:** `@packages/drizzle/schema`. In module `domain/` repositories, import **`getDb()`** from here, tables from schema, and query builders from **`drizzle-orm`** directly.

**Activity migrations:** use `db:migrate` for the shared activity rollout. Migration
`0004_shared_activity_event.sql` and `0005_activity_deletion_guard.sql` also install triggers that
`db:push` cannot install. See [the activity plan](../../docs/work/requirements/application-activity.md)
for the transition and remaining API/UI work.
