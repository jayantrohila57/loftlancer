import { readFileSync } from "node:fs";
import { join } from "node:path";
import "@loftlancer/env/server";
import "@loftlancer/env/auth-app";
import "@loftlancer/env/account";
import { withServiceBasePath } from "@loftlancer/env/next-service-base-path";
import { withSentryConfig } from "@sentry/nextjs/config";
import type { NextConfig } from "next";

/** Root package.json version, shown as the product version badge (#368). */
const appVersion = (
  JSON.parse(
    readFileSync(join(process.cwd(), "../../package.json"), "utf8"),
  ) as {
    version: string;
  }
).version;

/** Google sign-in shows only when both OAuth credentials exist (#359). */
const googleSignIn =
  process.env.GOOGLE_CLIENT_ID?.trim() &&
  process.env.GOOGLE_CLIENT_SECRET?.trim()
    ? "1"
    : "";
const nextConfig: NextConfig = withServiceBasePath("auth", {
  env: {
    NEXT_PUBLIC_APP_VERSION: appVersion,
    NEXT_PUBLIC_GOOGLE_SIGN_IN: googleSignIn,
  },
  experimental: {
    agentUpgrade: "security" as const,
  },
  typedRoutes: true,
  reactCompiler: true,
  transpilePackages: [
    "@loftlancer/ui",
    "@loftlancer/api",
    "@loftlancer/auth-client",
  ],
  async redirects() {
    return [
      {
        source: "/favicon.ico",
        destination: "/favicon/favicon.ico",
        permanent: false,
      },
    ];
  },
});

/**
 * Sentry source-map upload (#354). Uploads only when SENTRY_AUTH_TOKEN is set
 * (Vercel production); an upload failure logs and never fails the build.
 */
const sentryBuildOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  telemetry: false,
  // One release per product version, matching Sentry.init (#354).
  release: { name: `loftlancer@${appVersion}` },
  buildTimeInstrumentation: false,
  sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
  errorHandler: (err: Error) => {
    console.warn(`[sentry] source-map upload skipped: ${err.message}`);
  },
};

export default withSentryConfig(nextConfig, sentryBuildOptions);
