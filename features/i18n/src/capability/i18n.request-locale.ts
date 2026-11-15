import { notFound } from "next/navigation"
import { hasLocale } from "next-intl"
import { getMessages, setRequestLocale } from "next-intl/server"

import type { AppRouting } from "../types/i18n.types"
import { getLocaleDirection } from "../utils/i18n.utils"

export function createLocaleStaticParams(
  routing: AppRouting,
  localeSegment: "locale" | "lang" = "lang"
) {
  return function generateStaticParams() {
    return routing.locales.map((locale) => ({ [localeSegment]: locale }))
  }
}

type InitRequestI18nInput = {
  routing: AppRouting
  params: Promise<Record<string, string>>
  localeSegment?: "locale" | "lang"
}

export async function initRequestI18n({
  routing,
  params,
  localeSegment = "lang",
}: InitRequestI18nInput) {
  const segmentParams = await params
  const locale = segmentParams[localeSegment]

  if (!locale || !hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)
  const messages = await getMessages()
  const direction = getLocaleDirection(locale)

  return { direction, locale, messages }
}

export { NextIntlClientProvider as I18nClientProvider } from "next-intl"
