import {
  createAppI18nRoutingConfig,
  createAppRouting,
  createI18nMiddleware,
} from "@features/i18n"

const routing = createAppRouting(createAppI18nRoutingConfig())

export default createI18nMiddleware(routing)

/**
 * Paths are **without** `basePath` (Next strips `/auth` before matching).
 * Same patterns as `web` — see apps/auth/README.md.
 */
export const config = {
  matcher: ["/", "/(en-us|en-in|es-es)/:path*"],
}
