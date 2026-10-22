import type { LogAttributes, LogLevel, LogSink } from "./index";

/**
 * The slice of `@sentry/nextjs` the sink needs. Typed structurally so this
 * package carries no Sentry dependency; apps pass their own `Sentry` import.
 */
export type SentryLike = {
  logger: Record<
    LogLevel,
    (message: string, attributes?: Record<string, unknown>) => void
  >;
  captureException: (
    error: unknown,
    hint?: { extra?: Record<string, unknown> },
  ) => unknown;
  setUser: (user: { id: string } | null) => void;
  setTag: (key: string, value: string | undefined) => void;
};

/** Sentry Logs + issues + request identity (ids only), for `configureLogger`. */
export function createSentrySink(
  sentry: SentryLike,
  options?: { onAfterLog?: () => void },
): LogSink {
  return {
    log(level: LogLevel, message: string, attributes: LogAttributes) {
      sentry.logger[level](message, attributes);
      options?.onAfterLog?.();
    },
    captureException(error: unknown, attributes: LogAttributes) {
      sentry.captureException(error, { extra: attributes });
    },
    setIdentity({ userId, orgId }) {
      sentry.setUser(userId ? { id: userId } : null);
      sentry.setTag("org_id", orgId ?? undefined);
    },
  };
}

/** Header that carries the Sentry test-error token (#354). */
export const SENTRY_TEST_HEADER = "x-sentry-test-token";

type EventWithRequest = {
  request?: { headers?: Record<string, string> | undefined } | undefined;
};

/**
 * `beforeSend` scrubber: drops the test-error token
 * header (any casing) from captured request data, so the token never reaches
 * Sentry (#354).
 */
export function scrubSentryTestToken<T extends EventWithRequest>(event: T): T {
  const headers = event.request?.headers;
  if (headers) {
    for (const key of Object.keys(headers)) {
      if (key.toLowerCase() === SENTRY_TEST_HEADER) delete headers[key];
    }
  }
  return event;
}

type SpanWithAttributes = { attributes: Record<string, unknown> };

/**
 * Streamed spans use `beforeSendSpan` (transaction callbacks are ignored by
 * Sentry's default stream lifecycle). Remove any span attribute carrying the
 * test token header, including normalized `http.request.header.*` names.
 */
export function scrubSentryTestTokenFromSpan<T extends SpanWithAttributes>(
  span: T,
): T {
  for (const key of Object.keys(span.attributes)) {
    if (key.toLowerCase().includes(SENTRY_TEST_HEADER)) {
      delete span.attributes[key];
    }
  }
  return span;
}
