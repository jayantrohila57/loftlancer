/**
 * Shared server logger (#355). One JSON line per entry on stdout/stderr, so
 * Vercel runtime logs stay searchable, plus an optional sink that apps wire
 * to Sentry Logs in `instrumentation.ts`. No dependency on any SDK: packages
 * log through this, apps decide where it goes.
 *
 * Never pass secrets, tokens, env var values or request bodies as attributes.
 */

import type {
  LogAttributes,
  LogLevel,
  LogSink,
  RequestIdentity,
} from "../types/sentry.types";

type LoggerState = { sink?: LogSink; context: LogAttributes };

/**
 * Kept on globalThis: Next bundles instrumentation and route handlers as
 * separate chunks, and they must share one sink.
 */
const KEY = Symbol.for("loftlancer.sentry.logger");
function state(): LoggerState {
  const g = globalThis as typeof globalThis & { [KEY]?: LoggerState };
  g[KEY] ??= { context: {} };
  return g[KEY];
}

/** Register where logs go (e.g. Sentry) and static context such as the app name. */
export function configureLogger(options: {
  sink?: LogSink;
  context?: LogAttributes;
}): void {
  const s = state();
  if (options.sink) s.sink = options.sink;
  if (options.context) s.context = { ...s.context, ...options.context };
}

/** Error → flat attributes. Message and name only; stacks stay in Sentry issues. */
export function errorAttributes(error: unknown): LogAttributes {
  if (error instanceof Error) {
    const code = (error as { code?: unknown }).code;
    return {
      "error.name": error.name,
      "error.message": error.message,
      ...(typeof code === "string" || typeof code === "number"
        ? { "error.code": code }
        : {}),
    };
  }
  return { "error.message": String(error) };
}

function clean(attributes: LogAttributes): LogAttributes {
  const out: LogAttributes = {};
  for (const [key, value] of Object.entries(attributes)) {
    if (value !== undefined) out[key] = value;
  }
  return out;
}

function emit(level: LogLevel, message: string, attributes: LogAttributes) {
  const s = state();
  const merged = clean({ ...s.context, ...attributes });
  const line = JSON.stringify({ level, msg: message, ...merged });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
  try {
    s.sink?.log(level, message, merged);
  } catch {
    // A broken sink must never break the request that is logging.
  }
}

export const logger = {
  info(message: string, attributes: LogAttributes = {}) {
    emit("info", message, attributes);
  },
  warn(message: string, attributes: LogAttributes = {}) {
    emit("warn", message, attributes);
  },
  /** Log an error. Pass the caught value as `error` to record its name and message. */
  error(message: string, error?: unknown, attributes: LogAttributes = {}) {
    emit("error", message, {
      ...(error === undefined ? {} : errorAttributes(error)),
      ...attributes,
    });
  },
  /** Log an unexpected error AND report it as a Sentry issue with its stack. */
  exception(message: string, error: unknown, attributes: LogAttributes = {}) {
    emit("error", message, { ...errorAttributes(error), ...attributes });
    const s = state();
    try {
      s.sink?.captureException?.(error, clean({ ...s.context, ...attributes }));
    } catch {
      // Never let reporting break the caller.
    }
  },
};

/**
 * Tag the current request with the signed-in user and org (ids only), so
 * errors and logs can be traced to an account. No-op without a sink.
 */
export function setRequestIdentity(identity: RequestIdentity): void {
  try {
    state().sink?.setIdentity?.(identity);
  } catch {
    // Identity is best effort.
  }
}

/** Test hook: drop the sink and context. */
export function resetLoggerForTests(): void {
  const s = state();
  s.sink = undefined;
  s.context = {};
}
