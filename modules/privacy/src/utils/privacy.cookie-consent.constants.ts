export const PRIVACY_ANALYTICS_COOKIE_NAME = "loftlancer_analytics_consent"

/** One year — match common analytics consent persistence. */
export const PRIVACY_ANALYTICS_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365

export type PrivacyAnalyticsCookieValue = "granted" | "denied"
