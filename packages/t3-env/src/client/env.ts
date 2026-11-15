import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

const skipValidation = process.env.SKIP_ENV_VALIDATION === "true"

export const clientEnv = createEnv({
  client: {
    NEXT_PUBLIC_AUTH_APP_URL: z.url(),
    /** Sentry browser DSN; unset disables client instrumentation. */
    NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
    /** Product version badge + Sentry release (set in each app's `next.config`). */
    NEXT_PUBLIC_APP_VERSION: z.string().default("0.0.1"),
    /** PostHog project key; unset disables client analytics. */
    NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1).optional(),
    /** PostHog ingest host; defaults to US cloud when unset. */
    NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_AUTH_APP_URL: process.env.NEXT_PUBLIC_AUTH_APP_URL,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  },
  emptyStringAsUndefined: true,
  skipValidation,
})
