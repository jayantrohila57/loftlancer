import {
  isSentryTestRequest,
  sentryTestJson,
  sentryTestNotFound,
} from "@loftlancer/sentry/test";

export const dynamic = "force-dynamic";

/**
 * Token check for the browser Sentry test error on /sentry-test (#354). 200
 * only with the SENTRY_TEST_TOKEN value in the x-sentry-test-token header;
 * otherwise (or with the env var unset) a 404. Always `private, no-store`.
 */
export async function POST(request: Request) {
  if (!isSentryTestRequest(request)) return sentryTestNotFound();
  return sentryTestJson({ ok: true }, 200);
}

function notFound() {
  return sentryTestNotFound();
}

export {
  notFound as DELETE,
  notFound as GET,
  notFound as HEAD,
  notFound as OPTIONS,
  notFound as PATCH,
  notFound as PUT,
};
