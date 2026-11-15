import "@packages/t3-env/server"
import { createI18nNextPluginForApp } from "@features/i18n/plugin"
import {
  createSentryBuildOptions,
  readMonorepoAppVersion,
} from "@packages/sentry/next-config"
import { withSentryConfig } from "@sentry/nextjs/config"
import type { NextConfig } from "next"

import { consoleBasePath } from "./app.config"

const withNextIntl = createI18nNextPluginForApp("console")
const appVersion = readMonorepoAppVersion(process.cwd())

const nextConfig: NextConfig = {
  ...(consoleBasePath ? { basePath: consoleBasePath } : {}),
  env: {
    NEXT_PUBLIC_BASE_PATH: consoleBasePath,
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
    "@features/theme",
    "@features/i18n",
    "@packages/orpc",
    "@packages/react-query",
  ],
}

export default withSentryConfig(
  withNextIntl(nextConfig),
  createSentryBuildOptions(appVersion)
)
