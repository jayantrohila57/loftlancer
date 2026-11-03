import { createHash, timingSafeEqual } from "node:crypto";
import {
  SENTRY_TEST_HEADER,
  SENTRY_TEST_HEADERS,
  SENTRY_TEST_MIN_TOKEN_LENGTH,
} from "../constants/sentry.test.constants";

export {
  SENTRY_TEST_HEADER,
  SENTRY_TEST_HEADERS,
  SENTRY_TEST_MIN_TOKEN_LENGTH,
};

/**
 * Sentry test-error trigger guard (#354). Server only (node:crypto).
 *
 * The trigger routes answer 404 unless the request carries the token from the
 * server-only `SENTRY_TEST_TOKEN` env var in the `x-sentry-test-token`
 * header. Unset, blank or short (< 32 chars) env values fail closed.
 */

/** The configured token, or `null` when the trigger is off. */
export function sentryTestToken(
  value: string | undefined = process.env.SENTRY_TEST_TOKEN,
): string | null {
  const token = value?.trim() ?? "";
  return token.length >= SENTRY_TEST_MIN_TOKEN_LENGTH ? token : null;
}

function digest(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

/** Timing-safe comparison; false when either side is missing. */
export function isSentryTestTokenValid(
  provided: string | null | undefined,
  expected: string | null | undefined,
): boolean {
  if (!expected || !provided) return false;
  // Equal-length digests, so timingSafeEqual never throws or leaks length.
  return timingSafeEqual(digest(provided), digest(expected));
}

/** True only for a request carrying the configured token. */
export function isSentryTestRequest(
  request: Request,
  configured: string | undefined = process.env.SENTRY_TEST_TOKEN,
): boolean {
  return isSentryTestTokenValid(
    request.headers.get(SENTRY_TEST_HEADER),
    sentryTestToken(configured),
  );
}

/** The guard's answer for anything not allowed: an empty 404, never cached. */
export function sentryTestNotFound(): Response {
  return new Response(null, { status: 404, headers: SENTRY_TEST_HEADERS });
}

/** JSON response with the no-store headers. */
export function sentryTestJson(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...SENTRY_TEST_HEADERS,
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
