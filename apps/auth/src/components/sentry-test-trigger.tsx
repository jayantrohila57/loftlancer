"use client";

import {
  SentryTestPanel,
  type SentryTestResult,
} from "@features/observability/core/client";
import { SENTRY_TEST_HEADER } from "@loftlancer/sentry/sink";
import * as Sentry from "@sentry/nextjs";
import { withBasePath } from "@/lib/base-path";

const APP = "auth";

/** Thrown from app code so the Sentry stack trace maps to this file (#354). */
function throwBrowserTestError(): never {
  throw new Error(`Sentry test error (${APP}, browser)`);
}

async function trigger(token: string): Promise<SentryTestResult> {
  const res = await fetch(withBasePath("/api/sentry-test/browser"), {
    method: "POST",
    headers: { [SENTRY_TEST_HEADER]: token },
    cache: "no-store",
  });
  if (!res.ok) return { status: "rejected" };
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
  return <SentryTestPanel app={APP} requireToken onTrigger={trigger} />;
}
