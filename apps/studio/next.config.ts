import "@packages/t3-env/server"
import { createI18nNextPluginForApp } from "@features/i18n/plugin"
import {
  createSentryBuildOptions,
  readMonorepoAppVersion,
} from "@packages/sentry/next-config"
import { withSentryConfig } from "@sentry/nextjs/config"
import type { NextConfig } from "next"

import { studioBasePath } from "./app.config"

const withNextIntl = createI18nNextPluginForApp("studio")
const appVersion = readMonorepoAppVersion(process.cwd())

const nextConfig: NextConfig = {
  ...(studioBasePath ? { basePath: studioBasePath } : {}),
  env: {
    NEXT_PUBLIC_BASE_PATH: studioBasePath,
    NEXT_PUBLIC_APP_VERSION: appVersion,
  },
  cacheComponents: true,
  partialPrefetching: true,
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
    "@packages/orpc",
    "@packages/posthog",
    "@packages/react-query",
    "@packages/billing",
    "@modules/billing",
    "@modules/org",
    "@modules/storage",
    "@modules/auth",
    "@modules/activity",
    "@modules/ai-usage",
    "@modules/security",
    "@modules/shell",
    "@features/navigation",
    "@features/shell",
  ],
}

export default withSentryConfig(
  withNextIntl(nextConfig),
  createSentryBuildOptions(appVersion)
)
