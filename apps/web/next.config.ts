import "@packages/t3-env/server"
import { createI18nNextPluginForApp } from "@features/i18n/plugin"
import {
  createSentryBuildOptions,
  readMonorepoAppVersion,
} from "@packages/sentry/next-config"
import { withSentryConfig } from "@sentry/nextjs/config"
import type { NextConfig } from "next"

const withNextIntl = createI18nNextPluginForApp("web")
const appVersion = readMonorepoAppVersion(process.cwd())

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: appVersion,
  },
  cacheComponents: true,
  partialPrefetching: true,
  transpilePackages: [
    "@packages/better-auth",
    "@packages/billing",
    "@packages/drizzle",
    "@packages/logger",
    "@packages/posthog",
    "@packages/react-query",
    "@packages/sentry",
    "@packages/t3-env",
    "@packages/ui",
    "@features/font",
    "@features/theme",
    "@features/i18n",
    "@modules/shell",
    "@modules/auth",
  ],
}

export default withSentryConfig(
  withNextIntl(nextConfig),
  createSentryBuildOptions(appVersion)
)
