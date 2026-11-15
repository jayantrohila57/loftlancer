import type { Instrumentation } from "@opentelemetry/instrumentation"
import type { NodeSDK } from "@opentelemetry/sdk-node"

export type ObservabilityApp = "auth" | "console" | "studio" | "web"

export type TracingProvider = "none" | "otel" | "sentry"

export type OpenTelemetryServerInitOptions = {
  /** Return `false` to skip SDK start (e.g. Sentry owns tracing). */
  beforeSdkStart?: () => boolean | Promise<boolean>
  /** Optional extra instrumentations (HTTP, etc.). Default: none — avoids duplicate spans with Sentry. */
  instrumentations?: Instrumentation[]
  /** Last chance to adjust the SDK before `start()`. */
  configureSdk?: (sdk: NodeSDK) => void
}
