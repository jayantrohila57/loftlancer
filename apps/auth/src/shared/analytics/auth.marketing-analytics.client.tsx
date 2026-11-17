"use client"

import { useCookieAnalyticsConsent } from "@modules/privacy/client/hooks/privacy.cookie-analytics-consent.hook"

import { AuthConsentGatedTelemetry } from "@/shared/analytics/auth.consent-gated-telemetry.client"

export function AuthMarketingAnalytics() {
  const consent = useCookieAnalyticsConsent()
  return <AuthConsentGatedTelemetry consent={consent} />
}
