import { clientEnv } from "@packages/t3-env/client"

export function resolveSentryDsnClient(): string | undefined {
  const dsn = clientEnv.NEXT_PUBLIC_SENTRY_DSN?.trim() ?? ""
  return dsn.length > 0 ? dsn : undefined
}

export function resolveSentryEnvironmentClient(): string {
  return (
    process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV ?? "development"
  )
}

export function resolveSentryReleaseClient(): string {
  const version = clientEnv.NEXT_PUBLIC_APP_VERSION?.trim() || "0.0.1"
  return `loftlancer-template@${version}`
}
