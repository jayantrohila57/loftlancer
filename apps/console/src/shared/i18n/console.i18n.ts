import { defaultSupportedLocales } from "@features/i18n/constants"
import { i18nFormats } from "@features/i18n/formats"
import { defineAppI18n } from "@features/i18n/setup"

import type enUsMessages from "@/shared/i18n/messages/console.en-us.json"

export const appI18n = defineAppI18n({
  config: { locales: [...defaultSupportedLocales] },
  messageImports: {
    "en-us": () => import("@/shared/i18n/messages/console.en-us.json"),
    "en-in": () => import("@/shared/i18n/messages/console.en-in.json"),
    "es-es": () => import("@/shared/i18n/messages/console.es-es.json"),
  },
})

export const i18nConfig = appI18n.config

export type I18nMessages = typeof enUsMessages

export type I18nLocale = (typeof defaultSupportedLocales)[number]

export { i18nFormats }

export type I18nNamespace = keyof I18nMessages

export const {
  getPathname,
  Link,
  localeSegment,
  proxyConfig,
  proxyDefault,
  redirect,
  requestDefault,
  routing,
  usePathname,
  useRouter,
} = appI18n

/** next-intl plugin request entry (see `createI18nNextPluginForApp`). */
export { requestDefault as default }
