import { isThemeMode } from "@features/theme"
import type { AppearancePreferences } from "../utils/validation/appearance-preferences.schema"
import { applyAccountZoom } from "./apply-account-zoom"
import { applyInterfaceDensity } from "./apply-interface-density"
import { applySidebarBehavior } from "./apply-sidebar-behavior"

type ApplyAppearanceOptions = {
  setTheme?: (theme: string) => void
}

/** Clears signed-out account zoom and density overrides (theme stays on next-themes storage). */
export function clearSignedOutAppearancePreferences(): void {
  applyAccountZoom(null)
  applyInterfaceDensity(null)
}

/** Applies persisted appearance preferences to the live document and theme provider. */
export function applyStoredAppearancePreferences(
  prefs: AppearancePreferences,
  options: ApplyAppearanceOptions = {}
): void {
  if (prefs.theme && isThemeMode(prefs.theme)) {
    options.setTheme?.(prefs.theme)
  }

  applyInterfaceDensity(prefs.interfaceDensity ?? null)
  applySidebarBehavior(prefs.sidebarBehavior ?? null)
  applyAccountZoom(prefs.zoomLevel)
}
