import { initSentryEdge } from "@loftlancer/sentry/instrument";
import { initAndWireSentryServer } from "@loftlancer/sentry/instrument-server";
import * as Sentry from "@sentry/nextjs";

// Static export: register runs in dev only; production docs logs are browser-only (#355).
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await initAndWireSentryServer(Sentry, "docs");
    return;
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    initSentryEdge(Sentry, "docs");
  }
}

export const onRequestError = Sentry.captureRequestError;
