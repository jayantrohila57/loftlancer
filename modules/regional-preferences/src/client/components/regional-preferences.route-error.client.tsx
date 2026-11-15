"use client"

import { useTranslations } from "next-intl"
import { RegionalPreferencesFrame } from "./regional-preferences.frame"
import type { RegionalFormSection } from "./regional-preferences.layout"
import { regionalFormBodyMinHeightClass } from "./regional-preferences.layout"
import { RegionalLoadError } from "./regional-preferences.load-error.client"

const formSectionTitleKey: Record<
  RegionalFormSection,
  | "language"
  | "region"
  | "dateTimeSection"
  | "currency"
  | "grouping"
  | "measurementSystem"
> = {
  language: "language",
  region: "region",
  "date-time": "dateTimeSection",
  currency: "currency",
  numbers: "grouping",
  measurements: "measurementSystem",
}

const formSectionDescriptionKey: Record<
  RegionalFormSection,
  | "languageDescription"
  | "regionDescription"
  | "dateTimeDescription"
  | "currencyDescription"
  | "numberDescription"
  | "measurementDescription"
> = {
  language: "languageDescription",
  region: "regionDescription",
  "date-time": "dateTimeDescription",
  currency: "currencyDescription",
  numbers: "numberDescription",
  measurements: "measurementDescription",
}

export function AuthAccountRegionalFormRouteError({
  reset,
  section,
}: {
  readonly reset: () => void
  readonly section: RegionalFormSection
}) {
  const t = useTranslations("regionalPreferences")
  const titleKey = formSectionTitleKey[section]
  const descriptionKey = formSectionDescriptionKey[section]

  return (
    <RegionalPreferencesFrame
      description={t(descriptionKey)}
      title={t(titleKey)}
    >
      <RegionalLoadError
        className={`flex flex-col items-start justify-center gap-3 rounded-lg border border-border bg-muted/20 p-4 ${regionalFormBodyMinHeightClass[section]}`}
        message={t("loadError")}
        onRetry={reset}
      />
    </RegionalPreferencesFrame>
  )
}

export function AuthAccountRegionalOverviewRouteError({
  reset,
}: {
  readonly reset: () => void
}) {
  const t = useTranslations("regionalPreferences")
  const tUi = useTranslations("ui")

  return (
    <RegionalPreferencesFrame
      description={t("overviewIntro")}
      title={tUi("overview")}
    >
      <RegionalLoadError message={t("loadError")} onRetry={reset} />
    </RegionalPreferencesFrame>
  )
}
