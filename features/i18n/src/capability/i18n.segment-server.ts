import "server-only"

import { notFound } from "next/navigation"
import type { Locale } from "next-intl"
import { createTranslator, hasLocale } from "next-intl"
import { setRequestLocale } from "next-intl/server"

import type { AppRouting, MessagesLoader } from "../types/i18n.types"
import { getLocaleDirection } from "../utils/i18n.utils"

type SegmentParams = Readonly<Record<string, string>>

export type SegmentI18nTools = {
  initRequestI18n: (params: Promise<SegmentParams>) => Promise<{
    direction: ReturnType<typeof getLocaleDirection>
    locale: Locale
    messages: Record<string, unknown>
  }>
  getServerTranslations: (
    params: Promise<SegmentParams>,
    namespace: string
  ) => Promise<ReturnType<typeof createTranslator>>
}

export function createSegmentI18nTools(input: {
  getCachedMessages: MessagesLoader
  routing: AppRouting
  localeSegment: "locale" | "lang"
}): SegmentI18nTools {
  async function resolveLocale(params: Promise<SegmentParams>) {
    const segmentParams = await params
    const locale = segmentParams[input.localeSegment]
    if (!locale) {
      throw new Error(
        `Missing locale segment "${input.localeSegment}" in route params`
      )
    }
    return locale
  }

  async function initRequestI18n(params: Promise<SegmentParams>) {
    const locale = await resolveLocale(params)

    if (!hasLocale(input.routing.locales, locale)) {
      notFound()
    }

    setRequestLocale(locale)
    const messages = await input.getCachedMessages(locale)

    return {
      direction: getLocaleDirection(locale),
      locale,
      messages,
    }
  }

  async function getServerTranslations(
    params: Promise<SegmentParams>,
    namespace: string
  ) {
    const locale = await resolveLocale(params)

    if (!hasLocale(input.routing.locales, locale)) {
      notFound()
    }

    setRequestLocale(locale)
    const messages = await input.getCachedMessages(locale)

    return createTranslator({ locale, messages, namespace })
  }

  return {
    initRequestI18n,
    getServerTranslations,
  }
}
