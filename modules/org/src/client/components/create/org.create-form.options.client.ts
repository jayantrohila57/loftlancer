"use client"

import type { ComboboxOption } from "@features/form"
import type { useFormatter } from "next-intl"
import {
  currencyCodes,
  regionCodes,
} from "../../../../../regional-preferences/src/utils/constants/regional-preferences.iso"

type Format = ReturnType<typeof useFormatter>

export function buildOrgCountryOptions(format: Format): ComboboxOption[] {
  return [...regionCodes].map((value: string) => {
    const name = format.displayName(value, "region") ?? value
    return {
      value,
      label: `${name} (${value})`,
    }
  })
}

export function buildOrgCurrencyOptions(format: Format): ComboboxOption[] {
  return [...currencyCodes].map((value: string) => {
    const name = format.displayName(value, { type: "currency" }) ?? value
    return {
      value,
      label: `${name} (${value})`,
    }
  })
}
