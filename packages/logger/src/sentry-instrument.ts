import { configureLogger } from "./index";
import {
  createSentrySink,
  type SentryLike,
  scrubSentryTestToken,
  scrubSentryTestTokenFromSpan,
} from "./sentry";
import {
  resolveSentryDsn,
  resolveSentryEnvironment,
  resolveSentryRelease,
} from "./sentry-env";

export { scrubSentryTestToken } from "./sentry";
export {
  resolveSentryDsn,
  resolveSentryEnvironment,
  resolveSentryRelease,
} from "./sentry-env";

export type LoftlancerApp = "auth" | "studio" | "docs";

export type SentryInitLike = SentryLike & {
  init: (options: Record<string, unknown>) => void;
  flush?: (timeout?: number) => Promise<boolean>;
};

export type SentryInitExtras = Record<string, unknown>;

/** Shared Sentry.init fields for all runtimes (includes #354 scrubbing). */
export function buildSentryInitOptions(
  app: LoftlancerApp,
  forBrowser: boolean,
  extras?: SentryInitExtras,
): Record<string, unknown> {
  const dsn = resolveSentryDsn();
  if (!dsn) return {};
  return {
    dsn,
    release: resolveSentryRelease(),
    environment: resolveSentryEnvironment(forBrowser),
    initialScope: { tags: { app } },
    tracesSampleRate: 0.1,
    beforeSend: scrubSentryTestToken,
    beforeSendSpan: scrubSentryTestTokenFromSpan,
    ...extras,
  };
}

/** Wire @loftlancer/logger to Sentry Logs after Sentry.init. */
export function wireSentryLogger(
  sentry: SentryInitLike,
  app: LoftlancerApp,
  options: { runtime: "browser" | "server"; onAfterLog?: () => void },
): void {
  const release = resolveSentryRelease();
  configureLogger({
    context: {
      app,
      ...(options.runtime === "server" ? { release } : { runtime: "browser" }),
    },
    sink: createSentrySink(sentry, {
      onAfterLog: options.onAfterLog,
    }),
  });
}

/** Edge runtime: errors only (no server logger sink) (#355). */
export function initSentryEdge(
  sentry: SentryInitLike,
  app: LoftlancerApp,
  extras?: SentryInitExtras,
): void {
  const options = buildSentryInitOptions(app, false, extras);
  if (!options.dsn) return;
  sentry.init(options);
}
