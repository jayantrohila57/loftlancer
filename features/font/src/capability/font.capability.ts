import { loadFontConfig } from "../config/font.config"

/** Resolved font settings for app layouts (build-time / env). */
export function createFontCapability(
  overrides?: Parameters<typeof loadFontConfig>[0]
) {
  return loadFontConfig(overrides)
}
