import { serverEnv } from "@packages/t3-env/server"
import { appI18n } from "@/shared/i18n/auth.i18n"

const stateErrors = new Set([
  "state_expired",
  "state_invalid",
  "state_not_found",
  "state_mismatch",
  "state_security_mismatch",
])

/** Preserve the auth response and cookies while routing unrecoverable GitHub state errors to sign-in. */
export function githubStateErrorResponse(
  request: Request,
  response: Response
): Response {
  const requestUrl = new URL(request.url)
  if (
    !requestUrl.pathname.endsWith("/api/auth/callback/github") ||
    response.status !== 302
  )
    return response
  const location = response.headers.get("location")
  if (!location) return response
  let errorUrl: URL
  try {
    errorUrl = new URL(location, requestUrl.origin)
  } catch {
    return response
  }
  const error = errorUrl.searchParams.get("error")
  const authApp = new URL(serverEnv.BETTER_AUTH_URL)
  const appBase = authApp.pathname.replace(/\/$/, "")
  if (
    errorUrl.origin !== authApp.origin ||
    errorUrl.pathname !== `${appBase}/api/auth/error` ||
    !error ||
    !stateErrors.has(error)
  )
    return response
  const target = new URL(
    `${appBase}/${appI18n.routing.defaultLocale}/sign-in`,
    authApp.origin
  )
  target.searchParams.set("error", error)
  const headers = new Headers(response.headers)
  headers.set("location", target.toString())
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}
