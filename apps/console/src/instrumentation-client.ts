import {
  buildSentryInitOptions,
  wireSentryLogger,
} from "@packages/sentry/instrument-browser"
import * as Sentry from "@sentry/nextjs"

const options = buildSentryInitOptions("console")
if (options.dsn) {
  Sentry.init(options)
  wireSentryLogger(Sentry, "console")
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
