"use client"

import { defaultLocaleLabels } from "@features/i18n/constants"
import type { RegionalPreferences } from "@modules/regional-preferences/utils"
import type { useFormatter, useLocale, useTranslations } from "next-intl"

type RegionalT = ReturnType<typeof useTranslations<"regionalPreferences">>
type Format = ReturnType<typeof useFormatter>

export type RegionalOverviewDetailRow = {
  label: string
  value: string
  variant?: "default" | "emphasis" | "mono"
}

export type RegionalPreferenceRowDisplay = {
  details: RegionalOverviewDetailRow[]
  highlight?: string
  highlightSecondary?: string
  isUnset: boolean
}

function currencyNumberPreset(code: string) {
  if (code === "INR") return "inr" as const
  if (code === "EUR") return "eur" as const
  return "usd" as const
}

function hourCycleLabel(cycle: RegionalPreferences["hourCycle"], t: RegionalT) {
  if (cycle === "h12") return t("hours12")
  if (cycle === "h23") return t("hours24")
  return t("notSet")
}

function dateStyleLabel(style: RegionalPreferences["dateStyle"], t: RegionalT) {
  if (style === "short") return t("short")
  if (style === "medium") return t("medium")
  if (style === "long") return t("long")
  return t("notSet")
}

export function displayLanguagePreference(
  prefs: RegionalPreferences,
  pageLocale: ReturnType<typeof useLocale>,
  format: Format,
  t: RegionalT
): RegionalPreferenceRowDisplay {
  const sample = format.dateTime(new Date(), "dateTime")
  if (!prefs.language) {
    const tag = pageLocale
    const languageTag = tag.split("-")[0] ?? tag
    return {
      details: [
        { label: t("language"), value: t("notSet"), variant: "emphasis" },
        {
          label: t("previewLocaleTag"),
          value: pageLocale,
          variant: "mono",
        },
        {
          label: t("previewRowDisplayName"),
          value: format.displayName(languageTag, "language"),
        },
        {
          label: t("previewRowNote"),
          value: t("overviewActiveLocale", { locale: pageLocale }),
        },
      ],
      highlight: sample,
      isUnset: true,
    }
  }
  const name = defaultLocaleLabels[prefs.language] ?? prefs.language
  const languageTag = prefs.language.split("-")[0] ?? prefs.language
  return {
    details: [
      { label: t("language"), value: name, variant: "emphasis" },
      { label: t("previewLocaleTag"), value: prefs.language, variant: "mono" },
      {
        label: t("previewRowDisplayName"),
        value: format.displayName(languageTag, "language"),
      },
    ],
    highlight: sample,
    isUnset: false,
  }
}

export function displayRegionPreference(
  prefs: RegionalPreferences,
  format: Format,
  t: RegionalT
): RegionalPreferenceRowDisplay {
  if (!prefs.region) {
    return {
      details: [
        { label: t("region"), value: t("notSet"), variant: "emphasis" },
      ],
      isUnset: true,
    }
  }
  return {
    details: [
      {
        label: t("region"),
        value: format.displayName(prefs.region, "region"),
        variant: "emphasis",
      },
      {
        label: t("previewRegionCode"),
        value: prefs.region,
        variant: "mono",
      },
    ],
    isUnset: false,
  }
}

export function displayDateTimePreference(
  prefs: RegionalPreferences,
  format: Format,
  t: RegionalT
): RegionalPreferenceRowDisplay {
  const now = new Date()
  const dateLine = format.dateTime(now, "dateTime")
  const timeLine = format.dateTime(now, "time")

  if (!prefs.timeZone && !prefs.dateStyle && !prefs.hourCycle) {
    return {
      details: [
        { label: t("timeZone"), value: t("notSet") },
        { label: t("dateStyle"), value: t("notSet") },
        { label: t("hourCycle"), value: t("notSet") },
        { label: t("previewRowNote"), value: t("overviewDateTimeUnsetHint") },
      ],
      highlight: dateLine,
      highlightSecondary: timeLine,
      isUnset: true,
    }
  }

  const zone = prefs.timeZone
    ? prefs.timeZone.replaceAll("_", " ")
    : t("notSet")

  return {
    details: [
      { label: t("timeZone"), value: zone, variant: "emphasis" },
      {
        label: t("dateStyle"),
        value: dateStyleLabel(prefs.dateStyle, t),
      },
      {
        label: t("hourCycle"),
        value: hourCycleLabel(prefs.hourCycle, t),
      },
    ],
    highlight: dateLine,
    highlightSecondary: timeLine,
    isUnset: false,
  }
}

export function displayCurrencyPreference(
  prefs: RegionalPreferences,
  format: Format,
  t: RegionalT
): RegionalPreferenceRowDisplay {
  if (!prefs.currency) {
    const sample = format.number(1234.56, "usd")
    const small = format.number(9.99, "usd")
    return {
      details: [
        { label: t("currency"), value: t("notSet"), variant: "emphasis" },
        { label: t("previewRowExampleSmall"), value: small, variant: "mono" },
      ],
      highlight: sample,
      isUnset: true,
    }
  }
  const preset = currencyNumberPreset(prefs.currency)
  const name = format.displayName(prefs.currency, { type: "currency" })
  return {
    details: [
      {
        label: t("currency"),
        value: name ?? prefs.currency,
        variant: "emphasis",
      },
      {
        label: t("previewCurrencyCode"),
        value: prefs.currency,
        variant: "mono",
      },
      {
        label: t("previewRowExampleSmall"),
        value: format.number(9.99, preset),
        variant: "mono",
      },
    ],
    highlight: format.number(1234.56, preset),
    isUnset: false,
  }
}

export function displayNumberGroupingPreference(
  prefs: RegionalPreferences,
  format: Format,
  t: RegionalT
): RegionalPreferenceRowDisplay {
  const useGrouping = prefs.numberGrouping !== "never"
  const large = format.number(1_234_567.89, {
    useGrouping: prefs.numberGrouping ? useGrouping : true,
  })
  const compact = format.number(999, {
    useGrouping: prefs.numberGrouping ? useGrouping : true,
  })

  if (!prefs.numberGrouping) {
    return {
      details: [
        { label: t("grouping"), value: t("notSet"), variant: "emphasis" },
        { label: t("previewRowExampleSmall"), value: compact, variant: "mono" },
      ],
      highlight: large,
      isUnset: true,
    }
  }

  const mode =
    prefs.numberGrouping === "auto" ? t("automatic") : t("noGrouping")

  return {
    details: [
      { label: t("grouping"), value: mode, variant: "emphasis" },
      { label: t("previewRowExampleSmall"), value: compact, variant: "mono" },
    ],
    highlight: large,
    isUnset: false,
  }
}

export function displayMeasurementPreference(
  prefs: RegionalPreferences,
  t: RegionalT
): RegionalPreferenceRowDisplay {
  if (!prefs.measurementSystem) {
    return {
      details: [
        {
          label: t("measurementSystem"),
          value: t("notSet"),
          variant: "emphasis",
        },
      ],
      highlight: t("previewMeasurementDefault"),
      isUnset: true,
    }
  }
  const label =
    prefs.measurementSystem === "metric"
      ? t("metric")
      : prefs.measurementSystem === "us"
        ? t("usCustomary")
        : t("ukSystem")
  const sampleKey =
    prefs.measurementSystem === "metric"
      ? "previewMetricSamples"
      : prefs.measurementSystem === "us"
        ? "previewUsSamples"
        : "previewUkSamples"
  return {
    details: [
      { label: t("measurementSystem"), value: label, variant: "emphasis" },
    ],
    highlight: t(sampleKey),
    isUnset: false,
  }
}
