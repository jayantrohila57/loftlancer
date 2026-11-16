"use client"

import { callingCodeForRegion } from "@features/form"
import type { BrowserRegionalDefaults } from "@features/i18n/browser-defaults"
import { detectBrowserRegionalDefaults } from "@features/i18n/browser-defaults"
import {
  defaultAppLocale,
  defaultLocaleRegionCodes,
  defaultSupportedLocales,
} from "@features/i18n/constants"
import { useEffect, useState } from "react"
import type { z } from "zod"
import type { studioOnboardingOrganizationSchema } from "@/shared/onboarding/studio-onboarding-organization-schema.client"

type StudioOnboardingOrganizationValues = z.infer<
  ReturnType<typeof studioOnboardingOrganizationSchema>
>

const REGION_DEFAULT_CURRENCY: Record<string, string> = {
  AU: "AUD",
  CA: "CAD",
  CH: "CHF",
  ES: "EUR",
  GB: "GBP",
  IN: "INR",
  JP: "JPY",
  NZ: "NZD",
  SG: "SGD",
  US: "USD",
}

const REGION_DEFAULT_TIMEZONE: Record<string, string> = {
  AU: "Australia/Sydney",
  CA: "America/Toronto",
  CH: "Europe/Zurich",
  ES: "Europe/Madrid",
  GB: "Europe/London",
  IN: "Asia/Kolkata",
  JP: "Asia/Tokyo",
  NZ: "Pacific/Auckland",
  SG: "Asia/Singapore",
  US: "America/New_York",
}

const GENERIC_BROWSER_TIMEZONES = new Set(["UTC", "Etc/UTC", "Etc/GMT"])

function isGenericBrowserTimezone(timeZone: string | null | undefined): boolean {
  if (!timeZone?.trim()) return true
  return GENERIC_BROWSER_TIMEZONES.has(timeZone)
}

export function studioOnboardingTimezoneForCountry(countryCode: string): string {
  return REGION_DEFAULT_TIMEZONE[countryCode] ?? "UTC"
}

const STUDIO_ONBOARDING_EMPTY_BROWSER_DEFAULTS: BrowserRegionalDefaults = {
  region: null,
  timeZone: null,
}

export function studioOnboardingCurrencyForCountry(
  countryCode: string
): string {
  return REGION_DEFAULT_CURRENCY[countryCode] ?? "USD"
}

function resolveStudioOnboardingDefaultLanguage(activeLocale: string): string {
  if (
    defaultSupportedLocales.includes(
      activeLocale as (typeof defaultSupportedLocales)[number]
    )
  ) {
    return activeLocale
  }
  try {
    for (const tag of navigator.languages) {
      const normalized = tag.toLowerCase().replaceAll("_", "-")
      if (
        defaultSupportedLocales.includes(
          normalized as (typeof defaultSupportedLocales)[number]
        )
      ) {
        return normalized
      }
    }
    for (const tag of navigator.languages) {
      try {
        const region = new Intl.Locale(tag).region
        if (region) {
          const byRegion = defaultSupportedLocales.find(
            (loc) => defaultLocaleRegionCodes[loc] === region
          )
          if (byRegion) return byRegion
        }
      } catch {
        // Try the next browser language tag.
      }
    }
  } catch {
    // Browser APIs unavailable.
  }
  return defaultAppLocale
}

/** Maps browser detection + session locale to onboarding location defaults. */
export function studioOnboardingRegionalDefaultsFromDetected(
  activeLocale: string,
  detected: BrowserRegionalDefaults
) {
  const countryCode = detected.region ?? "US"
  const timezone = isGenericBrowserTimezone(detected.timeZone)
    ? studioOnboardingTimezoneForCountry(countryCode)
    : (detected.timeZone ?? studioOnboardingTimezoneForCountry(countryCode))
  return {
    countryCode,
    timezone,
    currencyCode: studioOnboardingCurrencyForCountry(countryCode),
    defaultLanguage: resolveStudioOnboardingDefaultLanguage(activeLocale),
    callingCode: callingCodeForRegion(countryCode),
  }
}

/** SSR-safe placeholders (US / UTC) until client detection runs. */
export function getStudioOnboardingRegionalPlaceholderDefaults(
  activeLocale: string
) {
  return studioOnboardingRegionalDefaultsFromDetected(
    activeLocale,
    STUDIO_ONBOARDING_EMPTY_BROWSER_DEFAULTS
  )
}

/** Browser- and session-derived defaults for onboarding location fields. */
export function getStudioOnboardingRegionalDefaults(activeLocale: string) {
  try {
    if (typeof navigator !== "undefined") {
      return studioOnboardingRegionalDefaultsFromDetected(
        activeLocale,
        detectBrowserRegionalDefaults()
      )
    }
  } catch {
    // Browser APIs unavailable.
  }
  return getStudioOnboardingRegionalPlaceholderDefaults(activeLocale)
}

/** Client hook: placeholders first, then detected browser region on mount. */
export function useStudioOnboardingRegionalDefaults(activeLocale: string) {
  const [defaults, setDefaults] = useState(() =>
    getStudioOnboardingRegionalPlaceholderDefaults(activeLocale)
  )
  useEffect(() => {
    setDefaults(
      studioOnboardingRegionalDefaultsFromDetected(
        activeLocale,
        detectBrowserRegionalDefaults()
      )
    )
  }, [activeLocale])
  return defaults
}

/** v2 setup from studio onboarding create form values. */
export function buildStudioOnboardingSetupV2(
  values: Pick<
    StudioOnboardingOrganizationValues,
    "type" | "contact" | "location"
  >
) {
  const businessPhone = values.contact.businessPhone?.trim()
  const city = values.location.city?.trim()
  const defaultLanguage = values.location.defaultLanguage?.trim()

  return {
    version: 2 as const,
    basics: {
      type: values.type,
    },
    contact: {
      primaryEmail: values.contact.primaryEmail.trim(),
      ...(businessPhone ? { businessPhone } : {}),
    },
    location: {
      countryCode: values.location.countryCode,
      timezone: values.location.timezone,
      currencyCode: values.location.currencyCode,
      ...(city ? { city } : {}),
      ...(defaultLanguage ? { defaultLanguage } : {}),
    },
    legal: { skipped: true as const },
  }
}
