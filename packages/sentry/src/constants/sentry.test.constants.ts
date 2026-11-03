/** Header that carries the Sentry test-error token (#354). */
export const SENTRY_TEST_HEADER = "x-sentry-test-token";

export const SENTRY_TEST_MIN_TOKEN_LENGTH = 32;

/** Sent on every trigger response, including the 404s. */
export const SENTRY_TEST_HEADERS = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow",
} as const;
