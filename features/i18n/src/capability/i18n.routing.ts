import { defineRouting } from "next-intl/routing"

import type { I18nRoutingConfig } from "../config/i18n.config"
import { loadI18nRoutingConfig } from "../config/i18n.config"

export function createAppRouting(config: I18nRoutingConfig) {
  const resolved = loadI18nRoutingConfig(config)
  return defineRouting({
    locales: resolved.locales,
    defaultLocale: resolved.defaultLocale,
    localePrefix: resolved.localePrefix,
  })
}
