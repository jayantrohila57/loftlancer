"use client"

import { useCookieAnalyticsConsent } from "@modules/privacy/client/hooks/privacy.cookie-analytics-consent.hook"
import { PostHogConsentBridge, posthogEnabled } from "@packages/posthog"
import { WebConsentGatedTelemetry } from "@/shared/analytics/web.consent-gated-telemetry.client"
import { clientEnv } from "@/shared/config/web.client-env"

export function WebMarketingAnalytics() {
  const consent = useCookieAnalyticsConsent()

  return (
    <>
      {posthogEnabled() ? (
        <PostHogConsentBridge consent={consent ?? "denied"} />
      ) : null}
      <WebConsentGatedTelemetry
        consent={consent}
        gaMeasurementId={clientEnv.NEXT_PUBLIC_GA_MEASUREMENT_ID}
      />
    </>
  )
}
