"use client"

import { ShellAccountRouteBoundaryPanel } from "@modules/shell"
import { useTranslations } from "next-intl"
import { RegionalPreferencesFrame } from "./regional-preferences.frame"

export function AuthAccountRegionalSectionNotFound() {
  const t = useTranslations("regionalPreferences")
  const tBoundaries = useTranslations("routeBoundaries")
  const tUi = useTranslations("ui")

  return (
    <RegionalPreferencesFrame
      description={t("overviewIntro")}
      title={tUi("languageRegion")}
    >
      <ShellAccountRouteBoundaryPanel
        backToSectionLabel={tBoundaries("backToSection")}
        description={tBoundaries("notFoundDescription")}
        showSectionHome
        title={tBoundaries("notFoundTitle")}
      />
    </RegionalPreferencesFrame>
  )
}
