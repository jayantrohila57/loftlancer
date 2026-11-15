/**
 * Read Sentry-related vars from `process.env` (not `@packages/t3-env/server`) so
 * `instrumentation.ts` edge bundles stay free of Node-only dotenv/path loading.
 */
export function resolveSentryDsnServer(): string | undefined {
  const publicDsn = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim() ?? ""
  const serverDsn = process.env.SENTRY_DSN?.trim() ?? ""
  const dsn = publicDsn || serverDsn
  return dsn.length > 0 ? dsn : undefined
}

export function resolveSentryEnvironmentServer(): string {
  return process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development"
}

export function resolveSentryRelease(): string {
  const version = process.env.NEXT_PUBLIC_APP_VERSION?.trim() || "0.0.1"
  return `loftlancer-template@${version}`
}
