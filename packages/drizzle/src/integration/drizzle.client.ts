import { serverEnv } from "@packages/t3-env/server"
import type { Db } from "./drizzle.integration"
import { createDb } from "./drizzle.integration"

const globalForDb = globalThis as unknown as {
  drizzleDb: Db | undefined
}

export interface InitDbOptions {
  readonly databaseUrl: string
}

/** Creates the process-wide client (idempotent). */
export function initDb({ databaseUrl }: InitDbOptions): Db {
  if (!globalForDb.drizzleDb) {
    globalForDb.drizzleDb = createDb({ databaseUrl })
  }
  return globalForDb.drizzleDb
}

/** Returns the global client, lazily initializing from validated `serverEnv.DATABASE_URL`. */
export function getDb(): Db | undefined {
  if (globalForDb.drizzleDb) {
    return globalForDb.drizzleDb
  }

  const databaseUrl = serverEnv.DATABASE_URL
  if (!databaseUrl) {
    return undefined
  }

  return initDb({ databaseUrl })
}
