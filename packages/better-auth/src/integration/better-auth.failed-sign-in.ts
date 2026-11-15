import { logger } from "@packages/logger/server"

/** Record observable failures without attributing an unverified identity. */
export function logFailedSignIn(request: Request, response: Response) {
  const url = new URL(request.url)
  const signIn = /\/sign-in\/(?:social|email|sso)$/.test(url.pathname)
  const callback = /\/callback\/[a-z0-9-]+$/i.test(url.pathname)
  if (!signIn && !callback) return

  const failed =
    response.status >= 400 || (callback && url.searchParams.has("error"))
  if (!failed) return

  try {
    logger.info("auth.sign_in.failed", {
      app: "auth",
      module: "security",
      actionId: "auth.sign_in",
      activityId: crypto.randomUUID(),
      outcome: "failed",
      statusCode: response.status,
      httpMethod: request.method,
    })
  } catch {
    // Diagnostic logging must not change the authentication response.
  }
}
