"use client"

import { useEffectiveAnalyticsConsent } from "@modules/privacy/client/hooks/privacy.effective-analytics-consent.hook"
import { authClient } from "@packages/better-auth/client"
import {
  PostHogConsentBridge,
  PostHogIdentity,
  posthogEnabled,
} from "@packages/posthog"

import { StudioConsentGatedTelemetry } from "@/shared/analytics/studio.consent-gated-telemetry.client"

type SessionWithOrg = {
  readonly session?: { readonly activeOrganizationId?: string | null }
}

export function StudioProductAnalytics() {
  const consent = useEffectiveAnalyticsConsent()
  const { data: session, isPending } = authClient.useSession()

  if (!posthogEnabled()) {
    return <StudioConsentGatedTelemetry consent={consent} />
  }

  const userId = session?.user.id ?? null
  const orgId =
    (session as SessionWithOrg | null)?.session?.activeOrganizationId ?? null
  const normalizedOrgId =
    typeof orgId === "string" && orgId.length > 0 ? orgId : null

  return (
    <>
      <PostHogConsentBridge consent={consent ?? "denied"} />
      <PostHogIdentity
        consent={consent ?? "denied"}
        isSessionPending={isPending}
        orgId={normalizedOrgId}
        userId={userId}
      />
      <StudioConsentGatedTelemetry consent={consent} />
    </>
  )
}
