import {
  createAppI18nRoutingConfig,
  createAppRouting,
  createI18nMiddleware,
} from "@features/i18n"

const routing = createAppRouting(createAppI18nRoutingConfig())

export default createI18nMiddleware(routing)

/** Keep in sync with app locales — see `defaultSupportedLocales` in @features/i18n. */
export const config = {
  matcher: ["/", "/(en-us|en-in|es-es)/:path*"],
}
