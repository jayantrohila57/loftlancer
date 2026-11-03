import { sql } from "drizzle-orm";

import { db } from "../core/drizzle.client";
import type {
  HealthCheckState,
  HealthReport,
} from "../types/drizzle.health.types";

export type {
  HealthCheckState,
  HealthReport,
} from "../types/drizzle.health.types";

/** Health responses must never be cached or indexed (#356). */
export const HEALTH_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  "X-Robots-Tag": "noindex, nofollow",
} as const;

/**
 * Cheap Postgres liveness probe: `select 1` on the shared pool, capped so an
 * uptime monitor never waits on a hung connection. Returns no error details,
 * so nothing about the database leaks to a public endpoint.
 */
export async function pingDatabase(
  timeoutMs = 3_000,
): Promise<{ status: HealthCheckState; latencyMs: number }> {
  const started = performance.now();
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      db.execute(sql`select 1`),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error("timeout")), timeoutMs);
      }),
    ]);
    return { status: "ok", latencyMs: Math.round(performance.now() - started) };
  } catch {
    return {
      status: "error",
      latencyMs: Math.round(performance.now() - started),
    };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/** Health JSON for an app with a database: 200 when up, 503 when the DB is down. */
export async function buildHealthReport(
  app: string,
  version: string,
): Promise<{ report: HealthReport; httpStatus: 200 | 503 }> {
  const database = await pingDatabase();
  const status: HealthCheckState = database.status;
  return {
    report: {
      status,
      app,
      version,
      checks: { database },
      time: new Date().toISOString(),
    },
    httpStatus: status === "ok" ? 200 : 503,
  };
}
