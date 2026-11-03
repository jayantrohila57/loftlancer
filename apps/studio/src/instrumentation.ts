import { initSentryEdge } from "@loftlancer/sentry/instrument";
import { initAndWireSentryServer } from "@loftlancer/sentry/instrument-server";
import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { installMailboxRecorder } = await import("@loftlancer/resend");
    installMailboxRecorder();
    await initAndWireSentryServer(Sentry, "studio");
    return;
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    initSentryEdge(Sentry, "studio");
  }
}

export const onRequestError = Sentry.captureRequestError;
