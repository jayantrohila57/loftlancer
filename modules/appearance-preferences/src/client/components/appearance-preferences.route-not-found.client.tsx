"use client"

import { ShellAccountRouteBoundaryPanel } from "@modules/shell"
import { useTranslations } from "next-intl"
import { AppearancePreferencesFrame } from "./appearance-preferences.frame"

export function AuthAccountAppearanceSectionNotFound() {
  const t = useTranslations("appearancePreferences")
  const tBoundaries = useTranslations("routeBoundaries")
  const tUi = useTranslations("ui")

  return (
    <AppearancePreferencesFrame
      description={t("overviewIntro")}
      title={tUi("appearance")}
    >
      <ShellAccountRouteBoundaryPanel
        backToSectionLabel={tBoundaries("backToSection")}
        description={tBoundaries("notFoundDescription")}
        showSectionHome
        title={tBoundaries("notFoundTitle")}
      />
    </AppearancePreferencesFrame>
  )
}
