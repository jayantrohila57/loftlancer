import "@packages/t3-env/server"
import { createI18nNextPluginForApp } from "@features/i18n/plugin"
import {
  createSentryBuildOptions,
  readMonorepoAppVersion,
} from "@packages/sentry/next-config"
import { withSentryConfig } from "@sentry/nextjs/config"
import type { NextConfig } from "next"

import { authBasePath } from "./auth.config"

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
  async redirects() {
    return [
      {
        source: "/:lang/account/security/user-activity",
        destination: "/:lang/account/activity/account",
        permanent: false,
      },
      {
        source: "/:lang/account/security/user-activity/data-management",
        destination: "/:lang/account/activity/data-management",
        permanent: false,
      },
      {
        source: "/:lang/account/security/activity",
        destination: "/:lang/account/activity/security",
        permanent: false,
      },
      {
        source: "/:lang/account/permissions",
        destination: "/:lang/account/security/permissions",
        permanent: false,
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
