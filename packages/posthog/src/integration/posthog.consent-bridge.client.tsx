"use client"

import { useEffect } from "react"

import type { PostHogConsent } from "../types/posthog.types"
import { applyPostHogConsent } from "./posthog.integration"

export type PostHogConsentBridgeProps = {
  readonly consent: PostHogConsent
}

/** Syncs account or banner consent with the PostHog client (ids-only product analytics). */
export function PostHogConsentBridge({ consent }: PostHogConsentBridgeProps) {
  useEffect(() => {
    applyPostHogConsent(consent)
  }, [consent])

  return null
}
