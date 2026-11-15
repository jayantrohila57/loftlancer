import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http"
import { resourceFromAttributes } from "@opentelemetry/resources"
import { NodeSDK } from "@opentelemetry/sdk-node"
import {
  ATTR_DEPLOYMENT_ENVIRONMENT_NAME,
  ATTR_SERVICE_NAME,
} from "@opentelemetry/semantic-conventions"

import {
  isOpenTelemetryTracingActive,
  resolveOpenTelemetryConfig,
} from "../config/observability.config"
import type {
  ObservabilityApp,
  OpenTelemetryServerInitOptions,
} from "../types/observability.types"

export {
  isOpenTelemetryTracingActive,
  isSentryTracingProvider,
  resolveOpenTelemetryConfig,
} from "../config/observability.config"
export type {
  ObservabilityApp,
  OpenTelemetryServerInitOptions,
  TracingProvider,
} from "../types/observability.types"

const SDK_KEY = Symbol.for("packages.observability.nodeSdk")

type GlobalObservability = typeof globalThis & {
  [SDK_KEY]?: NodeSDK
}

function globalSdk(): NodeSDK | undefined {
  return (globalThis as GlobalObservability)[SDK_KEY]
}

function setGlobalSdk(sdk: NodeSDK): void {
  ;(globalThis as GlobalObservability)[SDK_KEY] = sdk
}

/** Node.js `register()` hook — no-op when OTel is not configured or Sentry owns tracing. */
/** When OTLP tracing is active, disable Sentry performance traces to avoid duplicates. */
export function sentryTracingInitExtras():
  | { tracesSampleRate: number }
  | undefined {
  if (isOpenTelemetryTracingActive()) return { tracesSampleRate: 0 }
  return undefined
}

export async function initOpenTelemetryServer(
  app: ObservabilityApp,
  options: OpenTelemetryServerInitOptions = {}
): Promise<void> {
  const config = resolveOpenTelemetryConfig(app)
  if (!config.enabled) return
  if (globalSdk()) return

  if (options.beforeSdkStart) {
    const proceed = await options.beforeSdkStart()
    if (!proceed) return
  }

  const exporter = new OTLPTraceExporter({
    url: config.otlpTracesUrl,
    headers: config.otlpHeaders,
  })

  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: config.serviceName,
      [ATTR_DEPLOYMENT_ENVIRONMENT_NAME]: config.environment,
      app: app,
    }),
    traceExporter: exporter,
    instrumentations: options.instrumentations ?? [],
  })

  options.configureSdk?.(sdk)
  sdk.start()
  setGlobalSdk(sdk)

  const shutdown = () => {
    void sdk.shutdown()
  }
  process.once("SIGTERM", shutdown)
  process.once("beforeExit", shutdown)
}
