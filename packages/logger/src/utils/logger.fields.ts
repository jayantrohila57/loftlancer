import type { LogFields } from "../types/logger.types"

const allowedFields = [
  "app",
  "module",
  "actionId",
  "activityId",
  "correlationId",
  "requestId",
  "outcome",
  "durationMs",
  "errorCode",
  "errorDigest",
  "routeType",
  "procedure",
  "input",
  "output",
  "query",
  "headers",
  "statusCode",
  "httpMethod",
] as const

const secretKey =
  /password|passphrase|secret|token|api.?key|authorization|cookie|credential|session|private.?key|otp|verification|code/i

/** Bound payload size and redact secret-shaped keys before a transport sees data. */
export function sanitizeLogValue(
  value: unknown,
  depth = 0,
  seen = new WeakSet<object>(),
  budget = { remaining: 200 }
): unknown {
  if (--budget.remaining < 0) return "[truncated]"
  if (value === null || typeof value === "boolean" || typeof value === "number")
    return value
  if (typeof value === "string") {
    if (
      /bearer\s+\S+|-----BEGIN [^-]*PRIVATE KEY-----|\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/i.test(
        value
      )
    )
      return "[redacted]"
    return value.length > 1024 ? `${value.slice(0, 1024)}[truncated]` : value
  }
  if (typeof value !== "object") return `[${typeof value}]`
  if (depth >= 5) return "[max depth]"
  if (seen.has(value)) return "[circular]"
  seen.add(value)
  if (Array.isArray(value))
    return value
      .slice(0, 50)
      .map((item) => sanitizeLogValue(item, depth + 1, seen, budget))
  if (value instanceof Date)
    return Number.isNaN(value.getTime())
      ? "[invalid date]"
      : value.toISOString()
  if (
    Object.getPrototypeOf(value) !== Object.prototype &&
    Object.getPrototypeOf(value) !== null
  )
    return "[non-plain object]"
  try {
    return Object.fromEntries(
      Object.entries(value)
        .slice(0, 50)
        .map(([key, item]) => [
          key,
          secretKey.test(key)
            ? "[redacted]"
            : sanitizeLogValue(item, depth + 1, seen, budget),
        ])
    )
  } catch {
    return "[unreadable]"
  }
}

export function safeFields(fields: LogFields): LogFields {
  const result: LogFields = {}
  for (const key of allowedFields) {
    const value = fields[key]
    if (
      key === "input" ||
      key === "output" ||
      key === "query" ||
      key === "headers"
    ) {
      if (value !== undefined) result[key] = sanitizeLogValue(value)
    } else if (key === "statusCode") {
      if (
        typeof value === "number" &&
        Number.isInteger(value) &&
        value >= 100 &&
        value <= 599
      )
        result.statusCode = value
    } else if (key === "durationMs") {
      if (typeof value === "number" && Number.isFinite(value) && value >= 0)
        result.durationMs = value
    } else if (key === "outcome") {
      if (
        value === "success" ||
        value === "failed" ||
        value === "denied" ||
        value === "error"
      )
        result.outcome = value
    } else if (key === "errorDigest") {
      if (typeof value === "string" && /^\d{1,20}$/.test(value))
        result.errorDigest = value
    } else if (key === "routeType") {
      if (
        value === "render" ||
        value === "route" ||
        value === "action" ||
        value === "proxy"
      )
        result.routeType = value
    } else if (typeof value === "string") {
      Object.assign(result, { [key]: value })
    }
  }
  return result
}
