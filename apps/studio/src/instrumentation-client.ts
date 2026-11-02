import {
  buildSentryInitOptions,
  wireSentryLogger,
} from "@loftlancer/logger/sentry-instrument";
import * as Sentry from "@sentry/nextjs";

const options = buildSentryInitOptions("studio", true);
if (options.dsn) {
  Sentry.init(options);
  wireSentryLogger(Sentry, "studio", { runtime: "browser" });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

window.addEventListener("loftlancer.action.intent", (event) => {
  const action = (event as CustomEvent<{ action?: unknown }>).detail?.action;
  if (typeof action === "string")
    Sentry.addBreadcrumb({
      category: "action",
      message: action,
      level: "info",
      data: { "loftlancer.action": action },
    });
});
