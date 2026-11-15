import type {
  AppearancePreviewPalette,
  AppearancePreviewSrc,
} from "@features/form"
import type { AppearancePreferences } from "@modules/appearance-preferences/utils"
import { appearancePreviewAssets } from "./appearance-preferences.assets"

export function appearanceOverviewPreview(
  href: string,
  prefs: AppearancePreferences
): { palette: AppearancePreviewPalette; src: AppearancePreviewSrc } | null {
  switch (href) {
    case "/account/appearance/theme": {
      const choice = prefs.theme ?? "system"
      return {
        palette: choice === "system" ? "app" : choice,
        src: appearancePreviewAssets.theme[choice],
      }
    }
    case "/account/appearance/zoom": {
      const level = Number(prefs.zoomLevel ?? "100")
      const src =
        level <= 80
          ? appearancePreviewAssets.zoom.dense
          : level <= 100
            ? appearancePreviewAssets.zoom.default
            : appearancePreviewAssets.zoom.spacious
      return { palette: "app", src }
    }
    case "/account/appearance/density": {
      const src =
        prefs.interfaceDensity === "compact"
          ? appearancePreviewAssets.density.compact
          : prefs.interfaceDensity === "comfortable"
            ? appearancePreviewAssets.density.comfortable
            : appearancePreviewAssets.density.default
      return { palette: "app", src }
    }
    case "/account/appearance/sidebar": {
      const behavior = prefs.sidebarBehavior ?? "remember"
      return {
        palette: "app",
        src: appearancePreviewAssets.sidebar[behavior],
      }
    }
    default:
      return null
  }
}
