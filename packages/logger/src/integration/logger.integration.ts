import { AsyncLocalStorage } from "node:async_hooks"
import type { Writable } from "node:stream"
import winston from "winston"
import type {
  LogContext,
  LogFields,
  Logger,
  LogLevel,
} from "../types/logger.types"
import { safeFields } from "../utils/logger.fields"
import {
  formatDevEventMessage,
  formatDevLogFields,
  isDevLogging,
} from "../utils/logger.format"
import { BetterStackTransport } from "./logger.better-stack"

function queryFromRequestUrl(url: URL): Record<string, string> | undefined {
  if ([...url.searchParams.keys()].length === 0) return undefined
  return Object.fromEntries(url.searchParams.entries())
}

function headersFromHeaders(headers: Headers): Record<string, string> {
  const result: Record<string, string> = {}
  headers.forEach((value, key) => {
    result[key] = value
  })
  return result
}

async function devRequestInput(request: Request): Promise<unknown> {
  const contentType = request.headers.get("content-type") ?? ""
  if (!contentType.includes("json")) return undefined
  try {
    const text = await request.clone().text()
    if (!text) return undefined
    return JSON.parse(text) as unknown
  } catch {
    return undefined
  }
}

const logContext = new AsyncLocalStorage<LogContext>()

export function runWithLogContext<T>(
  context: LogContext,
  callback: () => T
): T {
  return logContext.run(
    { ...logContext.getStore(), ...safeFields(context) },
    callback
  )
}

export function getLogContext(): LogContext | undefined {
  return logContext.getStore()
}

export function withRequestLogging(
  app: string,
  route: string,
  handler: (request: Request) => Response | Promise<Response>
): (request: Request) => Promise<Response> {
  return async (request) =>
    runWithLogContext({ app, requestId: crypto.randomUUID() }, async () => {
      const started = Date.now()
      const url = new URL(request.url)
      const devFields = isDevLogging()
        ? {
            query: queryFromRequestUrl(url),
            headers: headersFromHeaders(request.headers),
            input: await devRequestInput(request),
          }
        : {}
      logger.info("api.started", {
        procedure: route,
        httpMethod: request.method,
        ...devFields,
      })
      try {
        const response = await handler(request)
        const completedFields = isDevLogging()
          ? { headers: headersFromHeaders(response.headers) }
          : {}
        logger.info("api.completed", {
          procedure: route,
          httpMethod: request.method,
          statusCode: response.status,
          durationMs: Date.now() - started,
          outcome: response.status < 400 ? "success" : "failed",
          ...completedFields,
        })
        return response
      } catch (error) {
        logger.error("api.failed", {
          procedure: route,
          httpMethod: request.method,
          outcome: "error",
          durationMs: Date.now() - started,
        })
        throw error
      }
    })
}

/** Server-only structured logging. Events and field values must not contain user content or secrets. */
export function createLogger(
  options: { level?: LogLevel; stream?: Writable; context?: LogContext } = {}
): Logger {
  const transport = options.stream
    ? new winston.transports.Stream({ stream: options.stream })
    : new winston.transports.Console()
  const transports: winston.transport[] = [transport]
  if (!options.stream && process.env.BETTER_STACK_SOURCE_TOKEN) {
    transports.push(new BetterStackTransport())
  }
  const pretty = isDevLogging() && !options.stream
  const backend = winston.createLogger({
    level: options.level ?? "info",
    format: pretty
      ? winston.format.combine(
          winston.format.timestamp(),
          winston.format.colorize({ level: true }),
          winston.format.printf(
            ({ level, message, timestamp, ...fields }) =>
              `${timestamp as string} ${level as string} ${formatDevEventMessage(message as string)}${
                Object.keys(fields).length > 0
                  ? `\n${formatDevLogFields(fields as LogFields)}`
                  : ""
              }`
          )
        )
      : winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        ),
    transports,
  })
  function scoped(context: LogContext): Logger {
    const log = (level: LogLevel, event: string, fields: LogFields = {}) => {
      backend.log({
        ...safeFields({ ...logContext.getStore(), ...context, ...fields }),
        level,
        message: event,
      })
    }
    return {
      child: (more) => scoped(safeFields({ ...context, ...more })),
      error: (event, fields) => log("error", event, fields),
      warn: (event, fields) => log("warn", event, fields),
      info: (event, fields) => log("info", event, fields),
      debug: (event, fields) => log("debug", event, fields),
    }
  }
  return scoped(safeFields(options.context ?? {}))
}

export const logger = createLogger()

/** Called by each application's Next.js server error hook. */
export function logRequestError(
  app: string,
  error: unknown,
  context: { routeType: "render" | "route" | "action" | "proxy" },
  target: Logger = logger
): void {
  const digest =
    typeof error === "object" && error !== null && "digest" in error
      ? error.digest
      : undefined
  target.error("request.unhandled_error", {
    app,
    outcome: "error",
    errorCode: "NEXT_REQUEST_ERROR",
    errorDigest: typeof digest === "string" ? digest : undefined,
    routeType: context.routeType,
  })
}
