import { serverEnv } from "@packages/t3-env/server"

export class BillingRateLimitError extends Error {
  readonly code = "rate_limited" as const
  constructor() {
    super("Too many requests for this plan.")
    this.name = "BillingRateLimitError"
  }
}

const FREE_LIMIT_PER_MINUTE = 60
const PAID_LIMIT_PER_MINUTE = 300

function redisRestConfig() {
  const url = serverEnv.UPSTASH_REDIS_REST_URL
  const token = serverEnv.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  return { url: url.replace(/\/$/, ""), token }
}

export function billingRateLimitForTier(planTier: "free" | "paid") {
  return planTier === "paid" ? PAID_LIMIT_PER_MINUTE : FREE_LIMIT_PER_MINUTE
}

export async function enforceBillingRateLimit(input: {
  organizationId: string
  planTier: "free" | "paid"
}): Promise<void> {
  const redis = redisRestConfig()
  if (!redis) return

  const limit = billingRateLimitForTier(input.planTier)
  const window = Math.floor(Date.now() / 60_000)
  const key = `billing:rl:${input.organizationId}:${window}`
  const response = await fetch(`${redis.url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${redis.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      ["INCR", key],
      ["EXPIRE", key, "120"],
    ]),
  })
  if (!response.ok) return
  const payload = (await response.json()) as { result?: unknown }[]
  const count = payload[0]?.result
  if (typeof count === "number" && count > limit) {
    throw new BillingRateLimitError()
  }
}
