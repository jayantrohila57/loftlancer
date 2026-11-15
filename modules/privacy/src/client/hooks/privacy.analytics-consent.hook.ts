"use client"

import { securityRpc } from "@modules/security/client"
import { authClient } from "@packages/better-auth/client"
import type { PostHogConsent } from "@packages/posthog"
import { useQuery } from "@packages/react-query"

const consentQueryKey = (userId: string | undefined) =>
  ["privacy", "analytics-consent", userId] as const

/**
 * Maps account privacy settings (`analyticsEnabled`) to PostHog consent.
 * Unsigned users are treated as denied; server default is off.
 */
export function usePrivacyAnalyticsConsent(): PostHogConsent | null {
  const { data: session, isPending: sessionPending } = authClient.useSession()
  const userId = session?.user.id

  const query = useQuery({
    queryKey: consentQueryKey(userId),
    enabled: Boolean(userId),
    queryFn: async () => {
      const result = await securityRpc.security.privacy.consents.get()
      if (result.status !== "success" || !result.data) {
        return false
      }
      return result.data.analyticsEnabled
    },
  })

  if (sessionPending) return null
  if (!userId) return "denied"
  if (query.isPending) return null
  return query.data ? "granted" : "denied"
}
