export type LogLevel = "error" | "warn" | "info" | "debug"

/** Only identifiers and operational fields belong here; never include secrets or user content. */
export interface LogContext {
  app?: string
  module?: string
  actionId?: string
  activityId?: string
  correlationId?: string
  requestId?: string
}

export interface LogFields extends LogContext {
  outcome?: "success" | "failed" | "denied" | "error"
  durationMs?: number
  errorCode?: string
  errorDigest?: string
  routeType?: "render" | "route" | "action" | "proxy"
  procedure?: string
  input?: unknown
  output?: unknown
  query?: unknown
  headers?: unknown
  statusCode?: number
  httpMethod?: string
}

export interface Logger {
  child(context: LogContext): Logger
  error(event: string, fields?: LogFields): void
  warn(event: string, fields?: LogFields): void
  info(event: string, fields?: LogFields): void
  debug(event: string, fields?: LogFields): void
}
