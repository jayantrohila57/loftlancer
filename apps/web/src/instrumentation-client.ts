import {
  buildSentryInitOptions,
  wireSentryLogger,
} from "@packages/sentry/instrument-browser"
import * as Sentry from "@sentry/nextjs"

const options = buildSentryInitOptions("web")
if (options.dsn) {
  Sentry.init(options)
  wireSentryLogger(Sentry, "web")
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
