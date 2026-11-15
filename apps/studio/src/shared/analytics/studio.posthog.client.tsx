"use client"

import { usePrivacyAnalyticsConsent } from "@modules/privacy/client"
import { authClient } from "@packages/better-auth/client"
import {
  PostHogConsentBridge,
  PostHogIdentity,
  posthogEnabled,
} from "@packages/posthog"

type SessionWithOrg = {
  readonly session?: { readonly activeOrganizationId?: string | null }
}

export function StudioPostHog() {
  const consent = usePrivacyAnalyticsConsent()
  const { data: session, isPending } = authClient.useSession()

  if (!posthogEnabled()) return null
  const userId = session?.user.id ?? null
  const orgId =
    (session as SessionWithOrg | null)?.session?.activeOrganizationId ?? null
  const normalizedOrgId =
    typeof orgId === "string" && orgId.length > 0 ? orgId : null

  return (
    <>
      <PostHogConsentBridge consent={consent} />
      <PostHogIdentity
        consent={consent}
        isSessionPending={isPending}
        orgId={normalizedOrgId}
        userId={userId}
      />
    </>
  )
}
