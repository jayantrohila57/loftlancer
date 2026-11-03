import {
  isSentryTestRequest,
  sentryTestJson,
  sentryTestNotFound,
} from "@loftlancer/sentry/test";
import * as Sentry from "@sentry/nextjs";

export const dynamic = "force-dynamic";

const APP = "studio";

/** Thrown from app code so the Sentry stack trace maps to this file (#354). */
function throwServerTestError(): never {
  throw new Error(`Sentry test error (${APP}, server)`);
}

/**
 * Server-side Sentry test error (#354). 404 unless the request carries the
 * SENTRY_TEST_TOKEN value in the x-sentry-test-token header (404 too when the
 * env var is unset). The token is scrubbed from Sentry events in
 * instrumentation.ts and never logged. Every response is `private, no-store`.
 */
export async function POST(request: Request) {
  if (!isSentryTestRequest(request)) return sentryTestNotFound();
  let eventId: string | undefined;
  try {
    throwServerTestError();
  } catch (error) {
    eventId = Sentry.captureException(error, {
      tags: { app: APP, test: "true", runtime: "server" },
    });
    await Sentry.flush(2000);
  }
  return sentryTestJson(
    { ok: true, app: APP, runtime: "server", eventId },
    500,
  );
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
