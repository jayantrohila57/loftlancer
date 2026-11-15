import type { I18nRoutingConfig } from "../config/i18n.config"
import type { TextDirection } from "../constants/i18n.constants"
import {
  defaultLocaleLabels,
  defaultLocaleRegionCodes,
  rtlLanguageTags,
} from "../constants/i18n.constants"

export function isLocaleInConfig(
  locale: string,
  config: I18nRoutingConfig
): boolean {
  return config.locales.some((configuredLocale) => configuredLocale === locale)
}

/** `dir` for `<html>` and shadcn `DirectionProvider` from active locale. */
export function getLocaleDirection(locale: string): TextDirection {
  const language = locale.split("-")[0]?.toLowerCase()
  if (language && (rtlLanguageTags as readonly string[]).includes(language)) {
    return "rtl"
  }
  return "ltr"
}

/** Regional indicator pair for a two-letter ISO country code (e.g. `US` → 🇺🇸). */
export function regionCodeToFlagEmoji(regionCode: string): string {
  const code = regionCode.trim().toUpperCase()
  if (code.length !== 2 || !/^[A-Z]{2}$/.test(code)) {
    return "🌐"
  }

  return [...code]
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join("")
}

export function getLocaleFlagEmoji(
  locale: string,
  regionCodes: Readonly<Record<string, string>> = defaultLocaleRegionCodes
): string {
  const segments = locale.split("-")
  const language = segments[0]?.toLowerCase()
  const regionFromTag =
    segments[1]?.length === 2 ? segments[1].toUpperCase() : undefined
  const region =
    regionFromTag ??
    (language ? regionCodes[language] : undefined) ??
    language?.toUpperCase().slice(0, 2)

  return region ? regionCodeToFlagEmoji(region) : "🌐"
}

export function getLocaleLabel(
  locale: string,
  labels: Readonly<Record<string, string>> = defaultLocaleLabels
): string {
  if (labels[locale]) {
    return labels[locale]
  }

  const language = locale.split("-")[0]?.toLowerCase()
  if (language && labels[language]) {
    return labels[language]
  }
  return locale
}
