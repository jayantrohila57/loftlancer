import {
  createAppI18nRoutingConfig,
  createAppRouting,
  createI18nMiddleware,
} from "@features/i18n"

const routing = createAppRouting(createAppI18nRoutingConfig())

export default createI18nMiddleware(routing)

/** Paths are relative to `basePath` when `NEXT_BASE_PATH` is set — see `app.config.ts`. */
export const config = {
  matcher: ["/", "/(en-us|en-in|es-es)/:path*"],
}
