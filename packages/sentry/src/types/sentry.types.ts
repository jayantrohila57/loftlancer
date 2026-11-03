/** Log severity for the shared console + optional Sentry sink. */
export type LogLevel = "info" | "warn" | "error";
export type LogValue = string | number | boolean | null | undefined;
export type LogAttributes = Record<string, LogValue>;

/** Who a request belongs to. Ids only, never emails or names (#354). */
export type RequestIdentity = {
  userId?: string | null;
  orgId?: string | null;
};

export type LogSink = {
  log: (level: LogLevel, message: string, attributes: LogAttributes) => void;
  captureException?: (error: unknown, attributes: LogAttributes) => void;
  setIdentity?: (identity: RequestIdentity) => void;
};

/**
 * The slice of `@sentry/nextjs` the sink needs. Typed structurally so this
 * package carries no hard Sentry dependency; apps pass their own `Sentry` import.
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

export type LoftlancerApp = "auth" | "studio" | "docs";

export type SentryInitLike = SentryLike & {
  init: (options: Record<string, unknown>) => void;
  flush?: (timeout?: number) => Promise<boolean>;
};

export type SentryInitExtras = Record<string, unknown>;

export type FlushableSentry = {
  flush?: (timeout?: number) => Promise<boolean>;
};
