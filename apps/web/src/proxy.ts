import {
  createAppI18nRoutingConfig,
  createAppRouting,
  createI18nMiddleware,
} from "@features/i18n"

const routing = createAppRouting(createAppI18nRoutingConfig())

export default createI18nMiddleware(routing)

/**
 * Keep locale list in sync with `defaultSupportedLocales` in @features/i18n.
 * The catch-all redirects bare paths (e.g. `/status`, `/pricing`) to the default locale.
 */
export const config = {
  matcher: [
    "/",
    "/(en-us|en-in|es-es)/:path*",
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
}
