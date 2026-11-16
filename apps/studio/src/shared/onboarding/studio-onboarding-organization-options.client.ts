"use client"

import type { ComboboxOption } from "@features/form"
import {
  defaultLocaleLabels,
  defaultSupportedLocales,
} from "@features/i18n/constants"
import {
  currencyCodes,
  regionCodes,
} from "@modules/regional-preferences/utils"
import type { useFormatter } from "next-intl"

type Format = ReturnType<typeof useFormatter>

export function buildStudioOnboardingCountryOptions(format: Format): ComboboxOption[] {
  return [...regionCodes].map((value: string) => {
    const name = format.displayName(value, "region") ?? value
    return {
      value,
      label: `${name} (${value})`,
    }
  })
}

export function buildStudioOnboardingCurrencyOptions(format: Format): ComboboxOption[] {
  return [...currencyCodes].map((value: string) => {
    const name = format.displayName(value, { type: "currency" }) ?? value
    return {
      value,
      label: `${name} (${value})`,
    }
  })
}

export function buildStudioOnboardingLanguageOptions(): ComboboxOption[] {
  return defaultSupportedLocales.map((value) => ({
    value,
    label: `${defaultLocaleLabels[value]} (${value})`,
  }))
}