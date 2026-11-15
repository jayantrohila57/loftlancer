import { SENTRY_TEST_HEADER } from "../constants/sentry.test.constants"
import type {
  LogAttributes,
  LogLevel,
  LogSink,
  SentryLike,
} from "../types/sentry.types"

export { SENTRY_TEST_HEADER }

export function createSentrySink(
  sentry: SentryLike,
  options?: { onAfterLog?: () => void }
): LogSink {
  return {
    log(level: LogLevel, message: string, attributes: LogAttributes) {
      sentry.logger[level](message, attributes)
      options?.onAfterLog?.()
    },
    captureException(error: unknown, attributes: LogAttributes) {
      sentry.captureException(error, { extra: attributes })
    },
    setIdentity({ userId, orgId }) {
      sentry.setUser(userId ? { id: userId } : null)
      sentry.setTag("org_id", orgId ?? undefined)
    },
  }
}

type EventWithRequest = {
  request?: { headers?: Record<string, string> | undefined } | undefined
}

export function scrubSentryTestToken<T extends EventWithRequest>(event: T): T {
  const headers = event.request?.headers
  if (headers) {
    for (const key of Object.keys(headers)) {
      if (key.toLowerCase() === SENTRY_TEST_HEADER) delete headers[key]
    }
  }
  return event
}

type SpanWithAttributes = { attributes: Record<string, unknown> }

export function scrubSentryTestTokenFromSpan<T extends SpanWithAttributes>(
  span: T
): T {
  for (const key of Object.keys(span.attributes)) {
    if (key.toLowerCase().includes(SENTRY_TEST_HEADER)) {
      delete span.attributes[key]
    }
  }
  return span
}
