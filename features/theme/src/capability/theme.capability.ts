import { loadThemeConfig } from "../config/theme.config"

/** Resolved theme provider settings for app layouts. */
export function createThemeCapability(
  overrides?: Parameters<typeof loadThemeConfig>[0]
) {
  return loadThemeConfig(overrides)
}
