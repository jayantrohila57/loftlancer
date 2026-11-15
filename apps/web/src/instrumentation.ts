import { initSentryEdge } from "@packages/sentry/instrument"
import * as Sentry from "@sentry/nextjs"

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initOpenTelemetryServer, sentryTracingInitExtras } = await import(
      "@packages/observability/instrument-server"
    )
    const { initAndWireSentryServer } = await import(
      "@packages/sentry/instrument-server"
    )
    await initOpenTelemetryServer("web")
    await initAndWireSentryServer(Sentry, "web", sentryTracingInitExtras())
    return
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    initSentryEdge(Sentry, "web")
  }
}

export const onRequestError = Sentry.captureRequestError
