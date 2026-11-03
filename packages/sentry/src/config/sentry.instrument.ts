import { configureLogger } from "../core/sentry.logger";
import type {
  LoftlancerApp,
  SentryInitExtras,
  SentryInitLike,
} from "../types/sentry.types";
import {
  createSentrySink,
  scrubSentryTestToken,
  scrubSentryTestTokenFromSpan,
} from "../utils/sentry.sink";
import {
  resolveSentryDsn,
  resolveSentryEnvironment,
  resolveSentryRelease,
} from "./sentry.env";

export type {
  LoftlancerApp,
  SentryInitExtras,
  SentryInitLike,
  SentryLike,
} from "../types/sentry.types";
export { scrubSentryTestToken } from "../utils/sentry.sink";
export {
  resolveSentryDsn,
  resolveSentryEnvironment,
  resolveSentryRelease,
} from "./sentry.env";

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

/** Wire @loftlancer/sentry to Sentry Logs after Sentry.init. */
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
