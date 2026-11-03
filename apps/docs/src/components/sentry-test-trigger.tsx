"use client";

import {
  SentryTestPanel,
  type SentryTestResult,
} from "@features/observability/core/client";
import * as Sentry from "@sentry/nextjs";

const APP = "docs";

/** Thrown from app code so the Sentry stack trace maps to this file (#354). */
function throwBrowserTestError(): never {
  throw new Error(`Sentry test error (${APP}, browser)`);
}

async function trigger(): Promise<SentryTestResult> {
  try {
    throwBrowserTestError();
  } catch (error) {
    const eventId = Sentry.captureException(error, {
      tags: { app: APP, test: "true", runtime: "browser" },
    });
    return { status: "sent", eventId };
  }
}

export function SentryTestTrigger() {
  return <SentryTestPanel app={APP} requireToken={false} onTrigger={trigger} />;
}
