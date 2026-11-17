import type { BetterAuthOptions } from "better-auth"

import { createUpstashSecondaryStorage } from "./better-auth.upstash-secondary-storage"

const MAGIC_LINK_RULE = { window: 60, max: 3 } as const
const SOCIAL_SIGN_IN_RULE = { window: 60, max: 10 } as const

export function resolveAuthSecondaryStorage() {
  return createUpstashSecondaryStorage()
}

export function resolveAuthRateLimitOptions(
  secondaryStorage: ReturnType<typeof createUpstashSecondaryStorage>
): BetterAuthOptions["rateLimit"] {
  const customRules = {
    "/sign-in/magic-link": MAGIC_LINK_RULE,
    "/sign-in/social": SOCIAL_SIGN_IN_RULE,
  } as const

  if (!secondaryStorage) {
    return {
      enabled: true,
      customRules,
    }
  }

  return {
    enabled: true,
    storage: "secondary-storage",
    customRules,
  }
}
