import { drizzle } from "drizzle-orm/node-postgres"
import pg from "pg"

import * as schema from "../schema/index"

export interface CreateDbOptions {
  readonly databaseUrl: string
}

function normalizeDatabaseUrl(databaseUrl: string): string {
  const url = new URL(databaseUrl)
  const sslMode = url.searchParams.get("sslmode")
  if (
    sslMode === "prefer" ||
    sslMode === "require" ||
    sslMode === "verify-ca"
  ) {
    url.searchParams.set("sslmode", "verify-full")
  }
  return url.toString()
}

export function createDb({ databaseUrl }: CreateDbOptions) {
  const pool = new pg.Pool({
    connectionString: normalizeDatabaseUrl(databaseUrl),
  })
  return drizzle(pool, { schema })
}

export type Db = ReturnType<typeof createDb>
