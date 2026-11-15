import type { AppearancePreferences } from "@modules/appearance-preferences/utils"

export type AppearancePreferenceRowDisplay = {
  details: {
    label: string
    value: string
    variant?: "default" | "emphasis" | "mono"
  }[]
  highlight?: string
  highlightSecondary?: string
  isUnset: boolean
}

type AppearanceT = ReturnType<
  typeof import("next-intl").useTranslations<"appearancePreferences">
>

export function displayThemePreference(
  prefs: AppearancePreferences,
  t: AppearanceT,
  tUi: ReturnType<typeof import("next-intl").useTranslations<"ui">>
): AppearancePreferenceRowDisplay {
  const isUnset = prefs.theme === null
  const value = isUnset
    ? t("notSet")
    : prefs.theme === "light"
      ? tUi("light")
      : prefs.theme === "dark"
        ? tUi("dark")
        : tUi("system")
  return {
    isUnset,
    details: [
      {
        label: t("savedValue"),
        value,
        variant: isUnset ? "default" : "emphasis",
      },
      { label: t("previewRowNote"), value: t("themePreviewNote") },
    ],
    highlight: isUnset ? t("notSet") : value,
  }
}

export function displayDensityPreference(
  prefs: AppearancePreferences,
  t: AppearanceT
): AppearancePreferenceRowDisplay {
  const isUnset = prefs.interfaceDensity === null
  const value = isUnset
    ? t("notSet")
    : prefs.interfaceDensity === "compact"
      ? t("compact")
      : t("comfortable")
  return {
    isUnset,
    details: [
      {
        label: t("savedValue"),
        value,
        variant: isUnset ? "default" : "emphasis",
      },
      { label: t("previewRowNote"), value: t("densityPreviewNote") },
    ],
    highlight: isUnset ? t("notSet") : value,
  }
}

export function displayZoomPreference(
  prefs: AppearancePreferences,
  t: AppearanceT
): AppearancePreferenceRowDisplay {
  const isUnset = prefs.zoomLevel === null
  const value = isUnset ? t("notSet") : `${prefs.zoomLevel}%`
  return {
    isUnset,
    details: [
      {
        label: t("savedValue"),
        value,
        variant: isUnset ? "default" : "emphasis",
      },
      { label: t("previewRowNote"), value: t("zoomPreviewNote") },
    ],
    highlight: isUnset ? t("notSet") : value,
  }
}

export function displaySidebarPreference(
  prefs: AppearancePreferences,
  t: AppearanceT
): AppearancePreferenceRowDisplay {
  const isUnset = prefs.sidebarBehavior === null
  const value = isUnset
    ? t("notSet")
    : prefs.sidebarBehavior === "expanded"
      ? t("sidebarExpanded")
      : prefs.sidebarBehavior === "collapsed"
        ? t("sidebarCollapsed")
        : t("sidebarRemember")
  return {
    isUnset,
    details: [
      {
        label: t("savedValue"),
        value,
        variant: isUnset ? "default" : "emphasis",
      },
      { label: t("previewRowNote"), value: t("sidebarPreviewNote") },
    ],
    highlight: isUnset ? t("notSet") : value,
  }
}
