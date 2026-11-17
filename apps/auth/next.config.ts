import "@packages/t3-env/server"
import { createI18nNextPluginForApp } from "@features/i18n/plugin"
import {
  createBaselineSecurityHeaders,
  createSentryBuildOptions,
  readMonorepoAppVersion,
} from "@packages/sentry/next-config"
import { withSentryConfig } from "@sentry/nextjs/config"
import type { NextConfig } from "next"
import type { Redirect } from "next/dist/lib/load-custom-routes"
import { authBasePath } from "./auth.config"
import { buildAuthMigratedStudioRedirects } from "./src/shared/auth/auth-studio-redirects"
import { buildWebLocalePath } from "./src/shared/auth/auth-web-app-url"

const withNextIntl = createI18nNextPluginForApp("auth")
const appVersion = readMonorepoAppVersion(process.cwd())

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: appVersion,
  },
  basePath: authBasePath,
  cacheComponents: true,
  partialPrefetching: true,
  // OAuth callback URLs contain one-time codes; structured logs omit URLs.
  logging: { incomingRequests: false },
  transpilePackages: [
    "@packages/better-auth",
    "@packages/drizzle",
    "@packages/logger",
    "@packages/sentry",
    "@packages/t3-env",
    "@packages/ui",
    "@features/font",
    "@features/form",
    "@features/theme",
    "@features/i18n",
  ],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: createBaselineSecurityHeaders(),
      },
    ]
  },
  async redirects(): Promise<Redirect[]> {
    return [
      ...(buildAuthMigratedStudioRedirects() as Redirect[]),
      {
        source: "/:lang/account/overview",
        destination: "/:lang/account",
        permanent: true,
      },
      {
        source: "/:lang/account/activity",
        destination: "/:lang/account/security/user-activity",
        permanent: true,
      },
      {
        source: "/:lang/account/activity/account",
        destination: "/:lang/account/security/user-activity",
        permanent: true,
      },
      {
        source: "/:lang/account/activity/security",
        destination: "/:lang/account/security/activity",
        permanent: true,
      },
      {
        source: "/:lang/account/activity/resource",
        destination: "/:lang/account/security/activity",
        permanent: true,
      },
      {
        source: "/:lang/account/activity/data-management",
        destination: "/:lang/account/security/user-activity/data-management",
        permanent: true,
      },
      {
        source: "/:lang/account/permissions",
        destination: "/:lang/account/security/permissions",
        permanent: true,
      },
      {
        source: "/:lang/account/help-support/help-center",
        destination: buildWebLocalePath(":lang", "/help"),
        permanent: true,
        basePath: false,
      },
      {
        source: "/:lang/account/help-support/help-center/:slug",
        destination: buildWebLocalePath(":lang", "/help/:slug"),
        permanent: true,
        basePath: false,
      },
      {
        source: "/",
        destination: `${authBasePath}/en-us`,
        permanent: false,
        basePath: false,
      },
    ]
  },
}

export default withSentryConfig(
  withNextIntl(nextConfig),
  createSentryBuildOptions(appVersion)
)
