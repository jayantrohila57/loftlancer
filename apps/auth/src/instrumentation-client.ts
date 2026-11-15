import {
  buildSentryInitOptions,
  wireSentryLogger,
} from "@packages/sentry/instrument-browser"
import * as Sentry from "@sentry/nextjs"

const options = buildSentryInitOptions("auth")
if (options.dsn) {
  Sentry.init(options)
  wireSentryLogger(Sentry, "auth")
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
