import "server-only"

import { createLocaleStaticParams } from "@features/i18n"
import { createSegmentI18nTools } from "@features/i18n/server"
import { appI18n } from "@/shared/i18n/console.i18n"
import { getConsoleCachedMessages } from "@/shared/i18n/console.i18n.cache"

const segmentI18n = createSegmentI18nTools({
  getCachedMessages: getConsoleCachedMessages,
  localeSegment: appI18n.localeSegment,
  routing: appI18n.routing,
})

export const getServerTranslations = segmentI18n.getServerTranslations

export const initRequestI18n = segmentI18n.initRequestI18n

export const generateLangStaticParams = createLocaleStaticParams(
  appI18n.routing,
  appI18n.localeSegment
)
