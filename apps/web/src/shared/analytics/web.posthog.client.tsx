"use client"

import { PostHogConsentBridge, posthogEnabled } from "@packages/posthog"

/**
 * Public web has no account consent source yet; PostHog stays opted out until
 * a marketing consent banner exists or the visitor uses a signed-in surface.
 */
export function WebPostHog() {
  if (!posthogEnabled()) return null
  return <PostHogConsentBridge consent="denied" />
}
