import { logger } from "../core/sentry.logger"
import {
  isSentryTestRequest,
  sentryTestJson,
  sentryTestNotFound,
} from "../utils/sentry.test-guard"

/**
 * Optional `/api/sentry-test` handler. Returns 404 unless
 * `x-sentry-test-token` matches `SENTRY_TEST_TOKEN` (32+ chars).
 */
export async function handleSentryTestRequest(
  request: Request
): Promise<Response> {
  if (!isSentryTestRequest(request)) {
    return sentryTestNotFound()
  }

  if (request.method === "GET") {
    return sentryTestJson({ ok: true, action: "ping" }, 200)
  }

  if (request.method === "POST") {
    const kind = new URL(request.url).searchParams.get("kind") ?? "exception"
    if (kind === "message") {
      logger.error("sentry.test.message", undefined, { kind: "message" })
      return sentryTestJson({ ok: true, kind: "message" }, 200)
    }
    const error = new Error("sentry.test.exception")
    logger.exception("sentry.test.exception", error, { kind: "exception" })
    return sentryTestJson({ ok: true, kind: "exception" }, 200)
  }

  return sentryTestNotFound()
}
