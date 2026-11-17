"use client"

import { authClient } from "@packages/better-auth/client"
import type { PostHogConsent } from "@packages/posthog"
import { usePrivacyAnalyticsConsent } from "./privacy.analytics-consent.hook"
import { useCookieAnalyticsConsent } from "./privacy.cookie-analytics-consent.hook"

/**
 * Signed-in users follow account privacy settings; visitors follow the cookie banner.
 */
export function useEffectiveAnalyticsConsent(): PostHogConsent | null {
  const { data: session, isPending: sessionPending } = authClient.useSession()
  const accountConsent = usePrivacyAnalyticsConsent()
  const cookieConsent = useCookieAnalyticsConsent()

  if (sessionPending) return null
  if (session?.user.id) return accountConsent
  return cookieConsent
}
