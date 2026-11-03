import {
  buildSentryInitOptions,
  wireSentryLogger,
} from "@loftlancer/sentry/instrument";
import * as Sentry from "@sentry/nextjs";

const options = buildSentryInitOptions("auth", true);
if (options.dsn) {
  Sentry.init(options);
  wireSentryLogger(Sentry, "auth", { runtime: "browser" });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
