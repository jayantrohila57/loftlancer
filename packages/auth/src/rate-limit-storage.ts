import { createHash } from "node:crypto";
import { logger } from "@loftlancer/logger";
import type { BetterAuthRateLimitStorage } from "better-auth";

type CounterResult = { count: number; ttl: number };
type RateLimitStorageDeps = {
  configured: boolean;
  increment: (
    key: string,
    window: number,
    max: number,
  ) => Promise<CounterResult>;
  warn: (message: string) => void;
};

const INCREMENT_WITH_TTL = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
return { count, redis.call('TTL', KEYS[1]) }
`;

export function createRateLimitStorage({
  configured,
  increment,
  warn,
}: RateLimitStorageDeps): BetterAuthRateLimitStorage {
  let warnedMissingConfig = false;
  let warnedUnavailable = false;

  return {
    async consume(key, rule) {
      if (!configured) {
        if (!warnedMissingConfig) {
          warnedMissingConfig = true;
          warn("shared auth rate limiting is not configured");
        }
        return { allowed: true, retryAfter: null };
      }

      const opaqueKey = createHash("sha256").update(key).digest("hex");
      try {
        const result = await increment(
          `${opaqueKey}:${rule.window}:${rule.max}`,
          rule.window,
          rule.max,
        );
        return {
          allowed: result.count <= rule.max,
          retryAfter: result.count <= rule.max ? null : Math.max(1, result.ttl),
        };
      } catch {
        // Authentication must continue during Redis outages. Never log keys
        // or credentials: Better Auth keys can include IPs or email addresses.
        if (!warnedUnavailable) {
          warnedUnavailable = true;
          warn("shared auth rate limiter unavailable; allowing request");
        }
        return { allowed: true, retryAfter: null };
      }
    },
  };
}

const redisUrl = process.env.KV_REST_API_URL?.trim().replace(/\/$/, "");
const redisToken = process.env.KV_REST_API_TOKEN?.trim();

export const upstashRateLimitStorage = createRateLimitStorage({
  configured: Boolean(redisUrl && redisToken),
  increment: async (key, window) => {
    const response = await fetch(redisUrl as string, {
      method: "POST",
      signal: AbortSignal.timeout(1000),
      headers: {
        Authorization: `Bearer ${redisToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        "EVAL",
        INCREMENT_WITH_TTL,
        "1",
        `loftlancer:auth:ratelimit:${key}`,
        String(window),
      ]),
    });
    if (!response.ok) throw new Error("Upstash request failed");
    const payload = (await response.json()) as {
      result?: unknown;
      error?: unknown;
    };
    if (payload.error || !Array.isArray(payload.result)) {
      throw new Error("Upstash returned an invalid rate limit result");
    }
    const [rawCount, rawTtl] = payload.result;
    const count = Number(rawCount);
    const ttl = Number(rawTtl);
    if (!Number.isFinite(count) || !Number.isFinite(ttl)) {
      throw new Error("Upstash returned an invalid rate limit count");
    }
    return { count, ttl };
  },
  warn: (message) => logger.warn(message),
});
