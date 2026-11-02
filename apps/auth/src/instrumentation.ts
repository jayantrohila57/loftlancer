import { initSentryEdge } from "@loftlancer/logger/sentry-instrument";
import { initAndWireSentryServer } from "@loftlancer/logger/sentry-instrument-server";
import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { installMailboxRecorder } = await import("@loftlancer/mail");
    installMailboxRecorder();
    await initAndWireSentryServer(Sentry, "auth");
    return;
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    initSentryEdge(Sentry, "auth");
  }
}

export const onRequestError = Sentry.captureRequestError;
