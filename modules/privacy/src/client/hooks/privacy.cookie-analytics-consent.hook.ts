"use client"

import type { PostHogConsent } from "@packages/posthog"
import { useCallback, useEffect, useState } from "react"
import type { PrivacyAnalyticsCookieValue } from "../../utils/privacy.cookie-consent.constants"
import {
  readAnalyticsConsentCookie,
  writeAnalyticsConsentCookie,
} from "../utils/privacy.cookie-consent.storage"

export function useCookieAnalyticsConsent(): PostHogConsent | null {
  const [consent, setConsent] = useState<PostHogConsent | null>(null)

  useEffect(() => {
    const stored = readAnalyticsConsentCookie()
    setConsent(!stored ? "denied" : stored === "granted" ? "granted" : "denied")
  }, [])

  return consent
}

export function useCookieAnalyticsConsentBanner() {
  const [stored, setStored] = useState<
    "loading" | PrivacyAnalyticsCookieValue | null
  >("loading")

  useEffect(() => {
    setStored(readAnalyticsConsentCookie() ?? null)
  }, [])

  const showBanner = stored === null

  const accept = useCallback(() => {
    writeAnalyticsConsentCookie("granted")
    setStored("granted")
  }, [])

  const reject = useCallback(() => {
    writeAnalyticsConsentCookie("denied")
    setStored("denied")
  }, [])

  return { showBanner, accept, reject }
}
