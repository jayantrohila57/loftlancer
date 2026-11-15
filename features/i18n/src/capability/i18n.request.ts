import type { Locale } from "next-intl"
import { hasLocale } from "next-intl"
import { getRequestConfig } from "next-intl/server"

import { defaultI18nTimeZone, i18nFormats } from "../config/i18n.formats"
import type { I18nRequestConfigInput } from "../types/i18n.types"

async function resolveRequestLocale(
  requestLocale: Promise<string | undefined>,
  routing: I18nRequestConfigInput["routing"]
): Promise<Locale> {
  const requested = await requestLocale
  if (requested && hasLocale(routing.locales, requested)) {
    return requested
  }

  return routing.defaultLocale
}

export function createGetRequestConfig({
  routing,
  loadMessages,
}: I18nRequestConfigInput) {
  return getRequestConfig(async ({ requestLocale }) => {
    const locale = await resolveRequestLocale(requestLocale, routing)

    return {
      locale,
      messages: await loadMessages(locale),
      formats: i18nFormats,
      timeZone: defaultI18nTimeZone,
    }
  })
}
