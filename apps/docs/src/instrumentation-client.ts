import {
  buildSentryInitOptions,
  wireSentryLogger,
} from "@loftlancer/sentry/instrument";
import * as Sentry from "@sentry/nextjs";

const options = buildSentryInitOptions("docs", true);
if (options.dsn) {
  Sentry.init(options);
  wireSentryLogger(Sentry, "docs", { runtime: "browser" });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
