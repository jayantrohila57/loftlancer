import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { createSentrySink } from "./sentry";
import { resolveSentryDsn, resolveSentryEnvironment } from "./sentry-env";
import { buildSentryInitOptions } from "./sentry-instrument";

afterEach(() => {
  delete process.env.NEXT_PUBLIC_SENTRY_DSN;
  delete process.env.SENTRY_DSN;
  delete process.env.NEXT_PUBLIC_VERCEL_ENV;
  delete process.env.VERCEL_ENV;
  delete process.env.NODE_ENV;
});

test("resolveSentryDsn prefers NEXT_PUBLIC_SENTRY_DSN", () => {
  process.env.SENTRY_DSN = "https://sentry.io/server";
  process.env.NEXT_PUBLIC_SENTRY_DSN = "https://sentry.io/public";
  assert.equal(resolveSentryDsn(), "https://sentry.io/public");
});

test("resolveSentryDsn falls back to SENTRY_DSN", () => {
  process.env.SENTRY_DSN = "https://sentry.io/server";
  assert.equal(resolveSentryDsn(), "https://sentry.io/server");
});

test("resolveSentryEnvironment uses VERCEL_ENV on the server", () => {
  process.env.VERCEL_ENV = "production";
  process.env.NODE_ENV = "development";
  assert.equal(resolveSentryEnvironment(false), "production");
});

test("resolveSentryEnvironment uses NEXT_PUBLIC_VERCEL_ENV in the browser", () => {
  process.env.NEXT_PUBLIC_VERCEL_ENV = "preview";
  process.env.VERCEL_ENV = "production";
  process.env.NODE_ENV = "development";
  assert.equal(resolveSentryEnvironment(true), "preview");
});

test("createSentrySink calls onAfterLog after forwarding", () => {
  const calls: string[] = [];
  const sink = createSentrySink(
    {
      logger: {
        info: (message) => calls.push(`info:${message}`),
        warn: (message) => calls.push(`warn:${message}`),
        error: (message) => calls.push(`error:${message}`),
      },
      captureException: () => undefined,
      setUser: () => undefined,
      setTag: () => undefined,
    },
    { onAfterLog: () => calls.push("after") },
  );
  sink.log("info", "hello", { app: "test" });
  assert.deepEqual(calls, ["info:hello", "after"]);
});

test("Sentry init uses streamed span scrubbing instead of transactions", () => {
  process.env.SENTRY_DSN = "https://sentry.io/server";
  const options = buildSentryInitOptions("auth", false);
  assert.equal(typeof options.beforeSendSpan, "function");
  assert.equal("beforeSendTransaction" in options, false);
});
