import "server-only"

import { hasLocale } from "next-intl"
import { appI18n, redirect } from "@/shared/i18n/studio.i18n"

export function redirectStudio(lang: string, href: string): never {
  const locale = hasLocale(appI18n.routing.locales, lang)
    ? lang
    : appI18n.routing.defaultLocale
  redirect({ href, locale })
}
