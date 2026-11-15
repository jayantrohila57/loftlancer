"use client"

import type { ComboboxOption, FieldOption } from "@features/form"
import {
  defaultLocaleLabels,
  defaultSupportedLocales,
} from "@features/i18n/constants"
import { currencyCodes, regionCodes } from "@modules/regional-preferences/utils"
import type { useFormatter } from "next-intl"

type Format = ReturnType<typeof useFormatter>

export function buildLanguageOptions(notSetLabel: string): ComboboxOption[] {
  return [
    { value: "", label: notSetLabel },
    ...defaultSupportedLocales.map((value) => ({
      value,
      label: `${defaultLocaleLabels[value]} (${value})`,
    })),
  ]
}

export function buildRegionOptions(
  format: Format,
  notSetLabel: string
): ComboboxOption[] {
  return [
    { value: "", label: notSetLabel },
    ...Array.from(regionCodes, (value) => {
      const name = format.displayName(value, "region") ?? value
      return {
        value,
        label: `${name} (${value})`,
      }
    }),
  ]
}

export function buildCurrencyOptions(
  format: Format,
  notSetLabel: string
): ComboboxOption[] {
  return [
    { value: "", label: notSetLabel },
    ...Array.from(currencyCodes, (value) => {
      const name = format.displayName(value, { type: "currency" }) ?? value
      return {
        value,
        label: `${name} (${value})`,
      }
    }),
  ]
}

export function buildNumberGroupingOptions(
  notSetLabel: string,
  automaticLabel: string,
  noGroupingLabel: string
): FieldOption[] {
  return [
    { value: "", label: notSetLabel },
    { value: "auto", label: automaticLabel },
    { value: "never", label: noGroupingLabel },
  ]
}

export function buildMeasurementOptions(
  notSetLabel: string,
  notSetDescription: string,
  metric: string,
  metricExample: string,
  usCustomary: string,
  usExample: string,
  uk: string,
  ukExample: string
): FieldOption[] {
  return [
    { value: "", label: notSetLabel, description: notSetDescription },
    { value: "metric", label: metric, description: metricExample },
    { value: "us", label: usCustomary, description: usExample },
    { value: "uk", label: uk, description: ukExample },
  ]
}

export function buildDateStyleOptions(
  notSetLabel: string,
  short: string,
  medium: string,
  long: string
): FieldOption[] {
  return [
    { value: "", label: notSetLabel },
    { value: "short", label: short },
    { value: "medium", label: medium },
    { value: "long", label: long },
  ]
}

export function buildHourCycleOptions(
  notSetLabel: string,
  hours12: string,
  hours24: string
): FieldOption[] {
  return [
    { value: "", label: notSetLabel },
    { value: "h12", label: hours12 },
    { value: "h23", label: hours24 },
  ]
}
