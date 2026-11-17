"use client"

import { VercelWebTelemetry } from "@packages/analytics"
import type { PostHogConsent } from "@packages/posthog"

export function StudioConsentGatedTelemetry({
  consent,
}: {
  readonly consent: PostHogConsent | null
}) {
  if (consent !== "granted") return null
  return <VercelWebTelemetry />
}
