export const defaultLocalePrefix = "always" as const

export const localePrefixOptions = ["always", "as-needed", "never"] as const

export const defaultLocaleSegment = "lang" as const

/** BCP 47-style tags in URLs (lowercase, hyphen). */
export const defaultSupportedLocales = ["en-us", "en-in", "es-es"] as const

export const defaultAppLocale = "en-us" as const

export const defaultLocaleLabels: Record<
  (typeof defaultSupportedLocales)[number],
  string
> = {
  "en-us": "English (US)",
  "en-in": "English (India)",
  "es-es": "Español (España)",
}

export const defaultLocaleRegionCodes: Record<
  (typeof defaultSupportedLocales)[number],
  string
> = {
  "en-us": "US",
  "en-in": "IN",
  "es-es": "ES",
}

/**
 * Static proxy `config.matcher` for `defaultSupportedLocales`.
 * Next.js requires a compile-time literal — update when locales change.
 */
export const defaultMiddlewareMatcher = [
  "/",
  "/(en-us|en-in|es-es)/:path*",
] as const

/** BCP 47 language subtags that use right-to-left layout (extend when adding locales). */
export const rtlLanguageTags = ["ar", "he", "fa", "ur"] as const

export type TextDirection = "ltr" | "rtl"
