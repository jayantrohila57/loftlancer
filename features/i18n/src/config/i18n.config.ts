import { z } from "zod"

import {
  defaultAppLocale,
  defaultLocalePrefix,
  defaultLocaleSegment,
  defaultSupportedLocales,
  localePrefixOptions,
} from "../constants/i18n.constants"

const localeSchema = z.enum(defaultSupportedLocales)

export const i18nRoutingConfigSchema = z.object({
  locales: z.array(localeSchema).min(1),
  defaultLocale: localeSchema,
  localePrefix: z.enum(localePrefixOptions).default(defaultLocalePrefix),
  localeSegment: z.enum(["locale", "lang"]).default(defaultLocaleSegment),
})

export type I18nRoutingConfig = z.infer<typeof i18nRoutingConfigSchema>

export type AppI18nRoutingOverrides = Partial<I18nRoutingConfig>

export function loadI18nRoutingConfig(
  input: I18nRoutingConfig
): I18nRoutingConfig {
  const config = i18nRoutingConfigSchema.parse(input)
  if (!config.locales.includes(config.defaultLocale)) {
    throw new Error(
      `defaultLocale "${config.defaultLocale}" must be one of locales`
    )
  }
  return config
}

export function createAppI18nRoutingConfig(
  overrides: AppI18nRoutingOverrides = {}
): I18nRoutingConfig {
  return loadI18nRoutingConfig({
    locales: overrides.locales ?? [...defaultSupportedLocales],
    defaultLocale: overrides.defaultLocale ?? defaultAppLocale,
    localePrefix: overrides.localePrefix ?? defaultLocalePrefix,
    localeSegment: overrides.localeSegment ?? defaultLocaleSegment,
  })
}
