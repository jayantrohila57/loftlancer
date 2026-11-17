"use client"

import { VercelWebTelemetry } from "@packages/analytics"

type CookieAnalyticsConsent = "granted" | "denied" | "unset" | null

export function AuthConsentGatedTelemetry({
  consent,
}: {
  readonly consent: CookieAnalyticsConsent
}) {
  if (consent !== "granted") return null
  return <VercelWebTelemetry />
}
