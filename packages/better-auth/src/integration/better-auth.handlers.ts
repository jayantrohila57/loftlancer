import { withRequestLogging } from "@packages/logger/server"
import { toNextJsHandler } from "better-auth/next-js"
import { logFailedSignIn } from "./better-auth.failed-sign-in"
import { runWithOrgAuthActor } from "./better-auth.org-request-context"
import { getTrustedAuthOrigins } from "./better-auth.origins"
import { resolveAuthAppUrl } from "./better-auth.paths"
import { getAuth } from "./better-auth.server"
import { getSessionUserIdFromRequest } from "./better-auth.session-user"

function withAppBasePathOnRequest(request: Request): Request {
  const authAppUrl = resolveAuthAppUrl()
  const appBasePath = authAppUrl.pathname.replace(/\/$/, "")
  if (!appBasePath) {
    return request
  }

  const url = new URL(request.url)
  if (url.pathname.startsWith(appBasePath)) {
    return request
  }

  url.pathname = `${appBasePath}${url.pathname}`
  return new Request(url, request)
}

function corsHeaders(request: Request): Headers {
  const headers = new Headers({ Vary: "Origin" })
  const origin = request.headers.get("origin")
  if (origin && getTrustedAuthOrigins().includes(origin)) {
    headers.set("Access-Control-Allow-Origin", origin)
    headers.set("Access-Control-Allow-Credentials", "true")
  }
  return headers
}

function withCors(response: Response, request: Request): Response {
  const headers = new Headers(response.headers)
  const allowedOrigin = corsHeaders(request).get("Access-Control-Allow-Origin")
  headers.append("Vary", "Origin")
  if (allowedOrigin) {
    headers.set("Access-Control-Allow-Origin", allowedOrigin)
    headers.set("Access-Control-Allow-Credentials", "true")
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

export function createAuthRouteHandlers() {
  const { GET, POST } = toNextJsHandler(getAuth())

  return {
    GET: withRequestLogging("auth", "auth", async (request) => {
      const actorUserId = await getSessionUserIdFromRequest(request)
      const response = await runWithOrgAuthActor(actorUserId, () =>
        GET(withAppBasePathOnRequest(request))
      )
      logFailedSignIn(request, response)
      return withCors(response, request)
    }),
    POST: withRequestLogging("auth", "auth", async (request) => {
      const actorUserId = await getSessionUserIdFromRequest(request)
      const response = await runWithOrgAuthActor(actorUserId, () =>
        POST(withAppBasePathOnRequest(request))
      )
      logFailedSignIn(request, response)
      return withCors(response, request)
    }),
    OPTIONS: withRequestLogging("auth", "auth", (request) => {
      const headers = corsHeaders(request)
      if (!headers.has("Access-Control-Allow-Origin"))
        return new Response(null, { status: 403, headers })
      headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
      headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
      return new Response(null, { status: 204, headers })
    }),
  }
}
