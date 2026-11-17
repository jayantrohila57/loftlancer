import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { serverEnv } from "@/shared/config/web.server-env"

let contactRateLimit: Ratelimit | null | undefined

function getContactRateLimit(): Ratelimit | null {
  if (contactRateLimit !== undefined) {
    return contactRateLimit
  }

  if (
    !serverEnv.UPSTASH_REDIS_REST_URL ||
    !serverEnv.UPSTASH_REDIS_REST_TOKEN
  ) {
    contactRateLimit = null
    return contactRateLimit
  }

  const redis = new Redis({
    url: serverEnv.UPSTASH_REDIS_REST_URL,
    token: serverEnv.UPSTASH_REDIS_REST_TOKEN,
  })

  contactRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 h"),
    prefix: "web:contact",
  })

  return contactRateLimit
}

export async function assertWebContactRateLimit(
  identifier: string
): Promise<{ readonly allowed: true } | { readonly allowed: false }> {
  const limiter = getContactRateLimit()
  if (!limiter) {
    return { allowed: true }
  }

  const result = await limiter.limit(identifier)
  return result.success ? { allowed: true } : { allowed: false }
}