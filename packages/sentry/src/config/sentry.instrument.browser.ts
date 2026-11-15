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
  resolveSentryDsnClient,
  resolveSentryEnvironmentClient,
  resolveSentryReleaseClient,
} from "./sentry.env.client"
import { wireSentryLogger as wireSentryLoggerImpl } from "./sentry.wire-logger"

export function wireSentryLogger(
  sentry: SentryInitLike,
  app: LoftlancerApp,
  options?: { onAfterLog?: () => void }
): void {
  wireSentryLoggerImpl(sentry, app, {
    runtime: "browser",
    onAfterLog: options?.onAfterLog,
  })
}

export function buildSentryInitOptions(
  app: LoftlancerApp,
  extras?: SentryInitExtras
): Record<string, unknown> {
  const dsn = resolveSentryDsnClient()
  if (!dsn) return {}
  return {
    dsn,
    release: resolveSentryReleaseClient(),
    environment: resolveSentryEnvironmentClient(),
    initialScope: { tags: { app } },
    tracesSampleRate: 0.1,
    beforeSend: scrubSentryTestToken,
    beforeSendSpan: scrubSentryTestTokenFromSpan,
    ...extras,
  }
}
