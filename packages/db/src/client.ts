import { env } from "@loftlancer/env/server";
import { logger } from "@loftlancer/logger";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import {
  resolveDatabaseConnectionString,
  warnOnWeakDatabaseSslMode,
} from "./connection-url";
import * as schema from "./schema";

/**
 * Serverless-tuned pool (Vercel Fluid compute + Neon pooler / PgBouncer).
 * - Always the `-pooler` host in production (see resolveDatabaseConnectionString).
 * - Small `max`: PgBouncer multiplexes; many instances x big pools exhausts it.
 * - Short idle timeout so sockets frozen between invocations are dropped
 *   instead of being handed out dead (the source of "timeout exceeded when
 *   trying to connect" after a suspend).
 * - One pool per process, cached on globalThis so every bundle chunk and
 *   HMR reload reuses it.
 */
type DbGlobal = typeof globalThis & { __loftlancerPgPool?: Pool };
const g = globalThis as DbGlobal;

function createPool(): Pool {
  warnOnWeakDatabaseSslMode(env.DATABASE_URL, env.NODE_ENV, (message, attrs) =>
    logger.warn(message, attrs),
  );
  const connectionString = resolveDatabaseConnectionString(
    env.DATABASE_URL,
    env.DATABASE_URL_POOLED,
  );
  const pool = new Pool({
    connectionString,
    max: env.NODE_ENV === "production" ? 5 : 10,
    min: 0,
    // Keep warm connections between requests on the same instance: a fresh
    // TCP+TLS handshake per query was a large share of org-page latency.
    idleTimeoutMillis: 60_000,
    connectionTimeoutMillis: 8_000,
    maxLifetimeSeconds: 300,
    allowExitOnIdle: true,
    ssl:
      env.NODE_ENV === "production"
        ? {
            rejectUnauthorized: true,
          }
        : undefined,
  });
  // A broken idle client must not crash the function (unhandled 'error').
  pool.on("error", (error) => {
    logger.error("db idle client error", error);
  });
  return pool;
}

const pool = g.__loftlancerPgPool ?? createPool();
g.__loftlancerPgPool = pool;

export const db = drizzle(pool, { schema });
