import { serverEnv } from "@packages/t3-env/server"
import { Redis } from "@upstash/redis"
import type { BetterAuthOptions } from "better-auth"

type AuthSecondaryStorage = NonNullable<BetterAuthOptions["secondaryStorage"]>

const globalForRedis = globalThis as unknown as {
  upstashRedis: Redis | undefined
  upstashRedisKey: string | undefined
}

function redisClient(): Redis | undefined {
  const url = serverEnv.UPSTASH_REDIS_REST_URL
  const token = serverEnv.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return undefined

  const key = url
  if (globalForRedis.upstashRedis && globalForRedis.upstashRedisKey === key) {
    return globalForRedis.upstashRedis
  }

  const client = new Redis({ url, token })
  globalForRedis.upstashRedis = client
  globalForRedis.upstashRedisKey = key
  return client
}

export function createUpstashSecondaryStorage():
  | AuthSecondaryStorage
  | undefined {
  const redis = redisClient()
  if (!redis) return undefined

  return {
    get: (key) => redis.get(key),
    getAndDelete: async (key) => {
      const value = await redis.get(key)
      if (value != null) await redis.del(key)
      return value
    },
    increment: async (key, ttl) => {
      const count = await redis.incr(key)
      if (count === 1) await redis.expire(key, ttl)
      return count
    },
    set: async (key, value, ttl) => {
      if (ttl) await redis.set(key, value, { ex: ttl })
      else await redis.set(key, value)
    },
    delete: async (key) => {
      await redis.del(key)
    },
  }
}
