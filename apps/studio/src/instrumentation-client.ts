import {
  buildSentryInitOptions,
  wireSentryLogger,
} from "@packages/sentry/instrument-browser"
import * as Sentry from "@sentry/nextjs"

const options = buildSentryInitOptions("studio")
if (options.dsn) {
  Sentry.init(options)
  wireSentryLogger(Sentry, "studio")
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
