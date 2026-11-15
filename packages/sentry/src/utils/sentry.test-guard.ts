import { createHash, timingSafeEqual } from "node:crypto"
import { serverEnv } from "@packages/t3-env/server"
import {
  SENTRY_TEST_HEADER,
  SENTRY_TEST_HEADERS,
  SENTRY_TEST_MIN_TOKEN_LENGTH,
} from "../constants/sentry.test.constants"

export { SENTRY_TEST_HEADER, SENTRY_TEST_HEADERS, SENTRY_TEST_MIN_TOKEN_LENGTH }

export function sentryTestToken(
  value: string | undefined = serverEnv.SENTRY_TEST_TOKEN
): string | null {
  const token = value?.trim() ?? ""
  return token.length >= SENTRY_TEST_MIN_TOKEN_LENGTH ? token : null
}

function digest(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest()
}

export function isSentryTestTokenValid(
  provided: string | null | undefined,
  expected: string | null | undefined
): boolean {
  if (!expected || !provided) return false
  return timingSafeEqual(digest(provided), digest(expected))
}

export function isSentryTestRequest(
  request: Request,
  configured: string | undefined = serverEnv.SENTRY_TEST_TOKEN
): boolean {
  return isSentryTestTokenValid(
    request.headers.get(SENTRY_TEST_HEADER),
    sentryTestToken(configured)
  )
}

export function sentryTestNotFound(): Response {
  return new Response(null, { status: 404, headers: SENTRY_TEST_HEADERS })
}

export function sentryTestJson(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...SENTRY_TEST_HEADERS,
      "Content-Type": "application/json; charset=utf-8",
    },
  })
}
