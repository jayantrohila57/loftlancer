import {
  createAppI18nRoutingConfig,
  createAppRouting,
  createI18nMiddleware,
} from "@features/i18n"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { AUTH_RETURN_TO_HEADER } from "@/shared/auth/auth.session-return-to"

const routing = createAppRouting(createAppI18nRoutingConfig())
const intlMiddleware = createI18nMiddleware(routing)

const ACCOUNT_ROUTE = /^\/(en-us|en-in|es-es)\/account(?:\/|$)/

export default function proxy(request: NextRequest) {
  const intlResponse = intlMiddleware(request)
  if (!ACCOUNT_ROUTE.test(request.nextUrl.pathname)) {
    return intlResponse
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set(
    AUTH_RETURN_TO_HEADER,
    `${request.nextUrl.pathname}${request.nextUrl.search}`
  )

  if (intlResponse.headers.get("location")) {
    return intlResponse
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } })
  intlResponse.headers.forEach((value, key) => {
    response.headers.set(key, value)
  })
  return response
}

/**
 * Paths are **without** `basePath` (Next strips `/auth` before matching).
 * Same patterns as `web` — see apps/auth/README.md.
 */
export const config = {
  matcher: ["/", "/(en-us|en-in|es-es)/:path*"],
}
