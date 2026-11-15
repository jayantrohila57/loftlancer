import type {
  LoftlancerApp,
  SentryInitExtras,
  SentryInitLike,
} from "../types/sentry.types"
import {
  scrubSentryTestToken,
  scrubSentryTestTokenFromSpan,
} from "../utils/sentry.sink"
import {
  resolveSentryDsnServer,
  resolveSentryEnvironmentServer,
  resolveSentryRelease,
} from "./sentry.env.server"
import { wireSentryLogger as wireSentryLoggerImpl } from "./sentry.wire-logger"

export type {
  LoftlancerApp,
  SentryInitExtras,
  SentryInitLike,
  SentryLike,
} from "../types/sentry.types"
export { scrubSentryTestToken } from "../utils/sentry.sink"
export {
  resolveSentryDsnServer,
  resolveSentryEnvironmentServer,
  resolveSentryRelease,
} from "./sentry.env.server"

export function buildSentryInitOptions(
  app: LoftlancerApp,
  extras?: SentryInitExtras
): Record<string, unknown> {
  const dsn = resolveSentryDsnServer()
  if (!dsn) return {}
  return {
    dsn,
    release: resolveSentryRelease(),
    environment: resolveSentryEnvironmentServer(),
    initialScope: { tags: { app } },
    tracesSampleRate: 0.1,
    beforeSend: scrubSentryTestToken,
    beforeSendSpan: scrubSentryTestTokenFromSpan,
    ...extras,
  }
}

export function wireSentryLogger(
  sentry: SentryInitLike,
  app: LoftlancerApp,
  options: { runtime: "browser" | "server"; onAfterLog?: () => void }
): void {
  wireSentryLoggerImpl(sentry, app, {
    runtime: options.runtime,
    release: options.runtime === "server" ? resolveSentryRelease() : undefined,
    onAfterLog: options.onAfterLog,
  })
}

export function initSentryEdge(
  sentry: SentryInitLike,
  app: LoftlancerApp,
  extras?: SentryInitExtras
): void {
  const options = buildSentryInitOptions(app, extras)
  if (!options.dsn) return
  sentry.init(options)
}
