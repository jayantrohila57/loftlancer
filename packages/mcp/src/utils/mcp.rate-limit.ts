import { db } from "@loftlancer/drizzle";
import { rateLimitBucket } from "@loftlancer/drizzle/schema/rate-limit-bucket";
import { sql } from "drizzle-orm";

import { resolveMcpRateLimitConfig } from "../config/mcp.config";
import type { RateLimitConfig, RateLimitResult } from "../types/mcp.types";

/**
 * Fixed-window counter in Postgres (`rate_limit_bucket`).
 */
export async function consumeRateLimit(
  key: string,
  config: RateLimitConfig = resolveMcpRateLimitConfig(),
): Promise<RateLimitResult> {
  const now = new Date();
  const windowStart = new Date(
    Math.floor(now.getTime() / config.windowMs) * config.windowMs,
  );

  const inserted = await db
    .insert(rateLimitBucket)
    .values({ key, count: 1, windowStart })
    .onConflictDoUpdate({
      target: rateLimitBucket.key,
      set: {
        count: sql`CASE
          WHEN ${rateLimitBucket.windowStart} < ${windowStart}
            THEN 1
          ELSE ${rateLimitBucket.count} + 1
        END`,
        windowStart: sql`CASE
          WHEN ${rateLimitBucket.windowStart} < ${windowStart}
            THEN ${windowStart}
          ELSE ${rateLimitBucket.windowStart}
        END`,
      },
    })
    .returning({
      count: rateLimitBucket.count,
      windowStart: rateLimitBucket.windowStart,
    });

  const row = inserted[0];
  if (!row) {
    return { allowed: true, remaining: config.maxRequests };
  }

  const count = row.count;
  if (count > config.maxRequests) {
    const windowEnd = row.windowStart.getTime() + config.windowMs;
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((windowEnd - now.getTime()) / 1000),
    );
    return { allowed: false, retryAfterSeconds };
  }

  return {
    allowed: true,
    remaining: Math.max(0, config.maxRequests - count),
  };
}

export function mcpRateLimitKey(parts: {
  oauthClientId?: string | null;
  userId?: string | null;
  toolName?: string;
}): string {
  const client = parts.oauthClientId ?? "anonymous";
  const user = parts.userId ?? "anonymous";
  const tool = parts.toolName ?? "route";
  return `mcp:${client}:${user}:${tool}`;
}
