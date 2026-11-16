import {
  createAppI18nRoutingConfig,
  createAppRouting,
  createI18nMiddleware,
} from "@features/i18n"
import type { NextRequest } from "next/server"

import { studioLegacyRedirectResponse } from "@/shared/org/studio-legacy-redirects"

const routing = createAppRouting(createAppI18nRoutingConfig())
const intlMiddleware = createI18nMiddleware(routing)

export default function proxy(request: NextRequest) {
  const legacy = studioLegacyRedirectResponse(request)
  if (legacy) return legacy
  return intlMiddleware(request)
}

/** Paths are relative to `basePath` when `NEXT_BASE_PATH` is set — see `app.config.ts`. */
export const config = {
  matcher: ["/", "/(en-us|en-in|es-es)/:path*"],
}
