"use client"

import { GoogleAnalytics } from "@next/third-parties/google"
import { VercelWebTelemetry } from "@packages/analytics"
import type { PostHogConsent } from "@packages/posthog"

export type WebConsentGatedTelemetryProps = {
  readonly consent: PostHogConsent | null
  readonly gaMeasurementId?: string
}

export function WebConsentGatedTelemetry({
  consent,
  gaMeasurementId,
}: WebConsentGatedTelemetryProps) {
  if (consent !== "granted") return null

  return (
    <>
      <VercelWebTelemetry />
      {gaMeasurementId ? <GoogleAnalytics gaId={gaMeasurementId} /> : null}
    </>
  )
}
