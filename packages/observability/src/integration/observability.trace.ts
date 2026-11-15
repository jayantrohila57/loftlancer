import type { Span, Tracer } from "@opentelemetry/api"
import { context, SpanStatusCode, trace } from "@opentelemetry/api"

const DEFAULT_TRACER = "loftlancer"

export function getObservabilityTracer(instrumentationScope?: string): Tracer {
  return trace.getTracer(instrumentationScope ?? DEFAULT_TRACER)
}

export type WithSpanOptions = {
  attributes?: Record<string, string | number | boolean>
  tracer?: Tracer
}

export async function withSpan<T>(
  name: string,
  fn: (span: Span) => Promise<T> | T,
  options: WithSpanOptions = {}
): Promise<T> {
  const tracer = options.tracer ?? getObservabilityTracer()
  return tracer.startActiveSpan(name, async (span) => {
    if (options.attributes) {
      for (const [key, value] of Object.entries(options.attributes)) {
        span.setAttribute(key, value)
      }
    }
    try {
      const result = await fn(span)
      span.setStatus({ code: SpanStatusCode.OK })
      return result
    } catch (error) {
      span.setStatus({ code: SpanStatusCode.ERROR })
      span.recordException(
        error instanceof Error ? error : new Error(String(error))
      )
      throw error
    } finally {
      span.end()
    }
  })
}

export function runWithObservabilityContext<T>(fn: () => T): T {
  return context.with(context.active(), fn)
}
