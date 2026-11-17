import { serverEnv } from "@packages/t3-env/server"
import { drizzle } from "drizzle-orm/node-postgres"
import pg from "pg"

import * as schema from "../schema/index"

const globalForPool = globalThis as unknown as {
  pgPool: pg.Pool | undefined
  pgPoolKey: string | undefined
}

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

function resolvePoolMax(): number {
  if (serverEnv.DB_POOL_MAX != null) return serverEnv.DB_POOL_MAX
  return serverEnv.NODE_ENV === "production" ? 1 : 10
}

function getOrCreatePool(connectionString: string): pg.Pool {
  const max = resolvePoolMax()
  const poolKey = `${connectionString}|max=${max}`
  if (globalForPool.pgPool && globalForPool.pgPoolKey === poolKey) {
    return globalForPool.pgPool
  }

  const pool = new pg.Pool({
    connectionString,
    max,
    idleTimeoutMillis: 20_000,
  })
  globalForPool.pgPool = pool
  globalForPool.pgPoolKey = poolKey
  return pool
}

export function createDb({ databaseUrl }: CreateDbOptions) {
  const connectionString = normalizeDatabaseUrl(databaseUrl)
  return drizzle(getOrCreatePool(connectionString), { schema })
}

export type Db = ReturnType<typeof createDb>
