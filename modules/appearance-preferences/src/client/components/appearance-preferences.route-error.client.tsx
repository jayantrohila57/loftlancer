"use client"

import { RegionalLoadError } from "@modules/regional-preferences/client"
import { useTranslations } from "next-intl"
import { resolveAppearanceFormSectionCopy } from "./appearance-preferences.form.copy"
import { AppearancePreferencesFrame } from "./appearance-preferences.frame"
import type { AppearanceFormSection } from "./appearance-preferences.layout"
import { appearanceFormBodyMinHeightClass } from "./appearance-preferences.layout"

export function AuthAccountAppearanceFormRouteError({
  reset,
  section,
}: {
  readonly reset: () => void
  readonly section: AppearanceFormSection
}) {
  const t = useTranslations("appearancePreferences")
  const copy = resolveAppearanceFormSectionCopy(section, t)

  return (
    <AppearancePreferencesFrame
      description={copy.frameDescription}
      title={copy.frameTitle}
    >
      <RegionalLoadError
        className={`flex flex-col items-start justify-center gap-3 rounded-lg border border-border bg-muted/20 p-4 ${appearanceFormBodyMinHeightClass}`}
        message={t("loadError")}
        onRetry={reset}
      />
    </AppearancePreferencesFrame>
  )
}

export function AuthAccountAppearanceOverviewRouteError({
  reset,
}: {
  readonly reset: () => void
}) {
  const t = useTranslations("appearancePreferences")
  const tUi = useTranslations("ui")

  return (
    <AppearancePreferencesFrame
      description={t("overviewIntro")}
      title={tUi("overview")}
    >
      <RegionalLoadError message={t("loadError")} onRetry={reset} />
    </AppearancePreferencesFrame>
  )
}
