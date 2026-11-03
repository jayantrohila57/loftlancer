import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const sentryEnvSource = readFileSync(
  path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "../src/config/sentry.env.ts",
  ),
  "utf8",
);

test("sentry.env.ts uses direct process.env.NEXT_PUBLIC_ member access for client inlining", () => {
  assert.match(sentryEnvSource, /process\.env\.NEXT_PUBLIC_SENTRY_DSN/);
  assert.match(sentryEnvSource, /process\.env\.NEXT_PUBLIC_VERCEL_ENV/);
  assert.match(sentryEnvSource, /process\.env\.NEXT_PUBLIC_APP_VERSION/);
  assert.doesNotMatch(
    sentryEnvSource,
    /const\s+env\s*=\s*process\.env/,
    "alias breaks Next.js NEXT_PUBLIC inlining",
  );
  assert.doesNotMatch(
    sentryEnvSource,
    /(?<![\w.])env\.NEXT_PUBLIC_/,
    "indirect NEXT_PUBLIC reads are not inlined in client bundles",
  );
});
