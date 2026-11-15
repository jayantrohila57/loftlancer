import createMiddleware from "next-intl/middleware"

import type { AppRouting } from "../types/i18n.types"

export function createI18nMiddleware(routing: AppRouting) {
  return createMiddleware(routing)
}

export function createMiddlewareMatcher(locales: readonly string[]) {
  const localePattern = locales.join("|")
  return ["/", `/(${localePattern})/:path*`]
}
