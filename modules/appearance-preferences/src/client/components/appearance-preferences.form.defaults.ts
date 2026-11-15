import type { AppearancePreferences } from "@modules/appearance-preferences/utils"
import type { AppearanceFormSection } from "./appearance-preferences.layout"

/** Form control values when the user has not saved a preference (`null` in the DB). */
export const appearanceFormControlDefaults = {
  theme: "system",
  /** Empty string is the “Default” density radio option; saves as `null`. */
  density: "",
  /** Unset in the DB → remember (matches sidebar “not set” copy). */
  sidebar: "remember",
  zoom: "100",
} as const

export function appearanceFormControlValue(
  section: AppearanceFormSection,
  prefs: AppearancePreferences
): string {
  switch (section) {
    case "theme":
      return prefs.theme ?? appearanceFormControlDefaults.theme
    case "density":
      return prefs.interfaceDensity ?? appearanceFormControlDefaults.density
    case "sidebar":
      return prefs.sidebarBehavior ?? appearanceFormControlDefaults.sidebar
    case "zoom":
      return prefs.zoomLevel ?? appearanceFormControlDefaults.zoom
  }
}
