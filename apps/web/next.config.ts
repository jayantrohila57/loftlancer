import "@packages/t3-env/server"
import { createI18nNextPluginForApp } from "@features/i18n/plugin"
import {
  createBaselineSecurityHeaders,
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
  async headers() {
    return [
      {
        source: "/:path*",
        headers: createBaselineSecurityHeaders(),
      },
    ]
  },
  async redirects() {
    return [
      {
        source: "/:lang/product/website-builder",
        destination: "/:lang/product/planning-workspace",
        permanent: true,
      },
      {
        source: "/:lang/product/cloud-platform",
        destination: "/:lang/product/client-validation",
        permanent: true,
      },
      {
        source: "/:lang/product/analytics",
        destination: "/:lang/product/scope-insights",
        permanent: true,
      },
    ]
  },
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
    "@features/form",
    "@features/theme",
    "@features/i18n",
    "@modules/shell",
    "@modules/auth",
    "@packages/resend",
    "@packages/brand",
  ],
}

export default withSentryConfig(
  withNextIntl(nextConfig),
  createSentryBuildOptions(appVersion)
)
