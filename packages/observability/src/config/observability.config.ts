/**
 * `process.env` (not `@packages/t3-env/server`) so `instrumentation.ts` edge
 * analysis of dynamic `instrument-server` imports stays Node-dotenv-free.
 */
import type {
  ObservabilityApp,
  TracingProvider,
} from "../types/observability.types"

export type ResolvedOpenTelemetryConfig = {
  enabled: boolean
  provider: TracingProvider
  serviceName: string
  environment: string
  otlpTracesUrl: string | undefined
  otlpHeaders: Record<string, string> | undefined
}

function parseOtlpHeaders(
  raw: string | undefined
): Record<string, string> | undefined {
  if (!raw?.trim()) return undefined
  const headers: Record<string, string> = {}
  for (const part of raw.split(",")) {
    const trimmed = part.trim()
    if (!trimmed) continue
    const eq = trimmed.indexOf("=")
    if (eq <= 0) continue
    const key = trimmed.slice(0, eq).trim()
    const value = trimmed.slice(eq + 1).trim()
    if (key) headers[key] = value
  }
  return Object.keys(headers).length > 0 ? headers : undefined
}

function resolveOtlpTracesUrl(
  tracesEndpoint: string | undefined,
  baseEndpoint: string | undefined
): string | undefined {
  const direct = tracesEndpoint?.trim()
  if (direct) return direct
  const base = baseEndpoint?.trim()
  if (!base) return undefined
  const normalized = base.replace(/\/$/, "")
  if (normalized.endsWith("/v1/traces")) return normalized
  return `${normalized}/v1/traces`
}

export function resolveOpenTelemetryConfig(
  app: ObservabilityApp
): ResolvedOpenTelemetryConfig {
  const provider = (process.env.OBSERVABILITY_TRACING_PROVIDER ??
    "none") as TracingProvider
  const otlpTracesUrl = resolveOtlpTracesUrl(
    process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT
  )
  const explicitlyEnabled = process.env.OBSERVABILITY_TRACING_ENABLED === "true"
  const enabled =
    provider === "otel" &&
    (explicitlyEnabled || Boolean(otlpTracesUrl)) &&
    Boolean(otlpTracesUrl)

  return {
    enabled,
    provider,
    serviceName: process.env.OTEL_SERVICE_NAME?.trim() || app,
    environment: process.env.NODE_ENV ?? "development",
    otlpTracesUrl,
    otlpHeaders: parseOtlpHeaders(process.env.OTEL_EXPORTER_OTLP_HEADERS),
  }
}

export function isSentryTracingProvider(): boolean {
  return process.env.OBSERVABILITY_TRACING_PROVIDER === "sentry"
}

/** OTLP SDK export is on (provider + endpoint gate). App only affects default service name. */
export function isOpenTelemetryTracingActive(
  app: ObservabilityApp = "web"
): boolean {
  return resolveOpenTelemetryConfig(app).enabled
}
