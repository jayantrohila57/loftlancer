"use client"

import type { PrivacyAnalyticsCookieValue } from "../../utils/privacy.cookie-consent.constants"
import {
  PRIVACY_ANALYTICS_COOKIE_MAX_AGE_SECONDS,
  PRIVACY_ANALYTICS_COOKIE_NAME,
} from "../../utils/privacy.cookie-consent.constants"

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined
  const match = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
  if (!match) return undefined
  return decodeURIComponent(match.slice(name.length + 1))
}

export function readAnalyticsConsentCookie():
  | PrivacyAnalyticsCookieValue
  | undefined {
  const value = readCookie(PRIVACY_ANALYTICS_COOKIE_NAME)
  if (value === "granted" || value === "denied") return value
  return undefined
}

export function writeAnalyticsConsentCookie(
  value: PrivacyAnalyticsCookieValue
): void {
  // biome-ignore lint/suspicious/noDocumentCookie: matches repo sidebar/org cookie pattern for cross-subdomain consent
  document.cookie = `${PRIVACY_ANALYTICS_COOKIE_NAME}=${encodeURIComponent(value)}; path=/; max-age=${PRIVACY_ANALYTICS_COOKIE_MAX_AGE_SECONDS}; samesite=lax`
}
