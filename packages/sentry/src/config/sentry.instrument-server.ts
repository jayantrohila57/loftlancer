import { configureLogger } from "../core/sentry.logger";
import type {
  LoftlancerApp,
  SentryInitExtras,
  SentryInitLike,
} from "../types/sentry.types";
import { coalescedServerLogFlush } from "../utils/sentry.server-flush";
import { resolveSentryRelease } from "./sentry.env";
import { buildSentryInitOptions, wireSentryLogger } from "./sentry.instrument";

/** Node server runtime: init Sentry, coalesced log flush, and logger sink. */
export async function initAndWireSentryServer(
  sentry: SentryInitLike,
  app: LoftlancerApp,
  extras?: SentryInitExtras,
): Promise<void> {
  const options = buildSentryInitOptions(app, false, extras);
  if (!options.dsn) return;
  const release = resolveSentryRelease();
  configureLogger({ context: { app, release } });
  sentry.init(options);
  wireSentryLogger(sentry, app, {
    runtime: "server",
    onAfterLog: () => coalescedServerLogFlush(sentry),
  });
}
