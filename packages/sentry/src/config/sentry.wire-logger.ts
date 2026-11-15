import { configureLogger } from "../core/sentry.logger"
import type { LoftlancerApp, SentryInitLike } from "../types/sentry.types"
import { createSentrySink } from "../utils/sentry.sink"

export function wireSentryLogger(
  sentry: SentryInitLike,
  app: LoftlancerApp,
  options: {
    runtime: "browser" | "server"
    release?: string
    onAfterLog?: () => void
  }
): void {
  configureLogger({
    context: {
      app,
      ...(options.runtime === "server" && options.release
        ? { release: options.release }
        : { runtime: "browser" }),
    },
    sink: createSentrySink(sentry, {
      onAfterLog: options.onAfterLog,
    }),
  })
}
