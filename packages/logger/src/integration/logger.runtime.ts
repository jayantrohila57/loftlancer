import type {
  LogContext,
  LogFields,
  Logger,
  LogLevel,
} from "../types/logger.types"
import { safeFields } from "../utils/logger.fields"
import {
  formatDevLogFields,
  formatRuntimeDevLine,
  isDevLogging,
  runtimeLogFields,
} from "../utils/logger.format"

/** Runtime-safe JSON output for browser and Edge, where Winston cannot run. */
export function createRuntimeLogger(context: LogContext = {}): Logger {
  const log = (level: LogLevel, message: string, fields: LogFields = {}) => {
    const entry = {
      ...safeFields({ ...context, ...fields }),
      level,
      message,
      timestamp: new Date().toISOString(),
    }
    const emit =
      level === "error"
        ? console.error
        : level === "warn"
          ? console.warn
          : level === "info"
            ? console.info
            : console.debug
    if (isDevLogging()) {
      const fields = runtimeLogFields(entry)
      const line = formatRuntimeDevLine(level, message, entry.timestamp)
      if (Object.keys(fields).length > 0) emit(line, formatDevLogFields(fields))
      else emit(line)
      return
    }
    emit(JSON.stringify(entry))
  }
  return {
    child: (more) => createRuntimeLogger({ ...context, ...more }),
    error: (event, fields) => log("error", event, fields),
    warn: (event, fields) => log("warn", event, fields),
    info: (event, fields) => log("info", event, fields),
    debug: (event, fields) => log("debug", event, fields),
  }
}

export function logRuntimeRequestError(
  app: string,
  error: unknown,
  context: { routeType: "render" | "route" | "action" | "proxy" }
): void {
  const digest =
    typeof error === "object" && error !== null && "digest" in error
      ? error.digest
      : undefined
  createRuntimeLogger({ app }).error("request.unhandled_error", {
    outcome: "error",
    errorCode: "NEXT_REQUEST_ERROR",
    errorDigest: typeof digest === "string" ? digest : undefined,
    routeType: context.routeType,
  })
}

/** Returns cleanup for tests and hot reload; never sends browser data to a server. */
export function installBrowserErrorLogging(app: string): () => void {
  const logger = createRuntimeLogger({ app })
  const onError = () =>
    logger.error("browser.unhandled_error", { outcome: "error" })
  const onRejection = () =>
    logger.error("browser.unhandled_rejection", { outcome: "error" })
  window.addEventListener("error", onError)
  window.addEventListener("unhandledrejection", onRejection)
  return () => {
    window.removeEventListener("error", onError)
    window.removeEventListener("unhandledrejection", onRejection)
  }
}
