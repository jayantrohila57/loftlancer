import { trace } from "@opentelemetry/api"

/** Bounded trace correlation fields for structured logs (no PII). */
export function observabilityLogFields(): Record<string, string> {
  const span = trace.getActiveSpan()
  if (!span) return {}
  const { traceId, spanId, traceFlags } = span.spanContext()
  if (!traceId || traceId === "00000000000000000000000000000000") return {}
  return {
    traceId,
    spanId,
    traceFlags: String(traceFlags),
  }
}
