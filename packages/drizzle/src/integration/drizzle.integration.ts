import { drizzle } from "drizzle-orm/node-postgres"
import pg from "pg"

import * as schema from "../schema/index"

export interface CreateDbOptions {
  readonly databaseUrl: string
}

export function createDb({ databaseUrl }: CreateDbOptions) {
  const pool = new pg.Pool({ connectionString: databaseUrl })
  return drizzle(pool, { schema })
}

export type Db = ReturnType<typeof createDb>
