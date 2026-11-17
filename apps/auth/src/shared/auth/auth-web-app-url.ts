/**
 * Read Web URL vars from `process.env` (not `@packages/t3-env/server`) so
 * `next.config.ts` can import this module without nested transpile issues.
 */
export function resolveWebAppOrigin(): string {
  const development = process.env.NODE_ENV !== "production"
  const authUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3002/auth"
  const fallback = development
    ? "http://localhost:3001"
    : new URL("/", authUrl).toString()
  return (
    process.env.WEB_APP_URL ??
    process.env.APP_PUBLIC_URL ??
    fallback
  ).replace(/\/$/, "")
}

export function buildWebLocalePath(lang: string, path: string): string {
  const normalized = path.trim()
  const suffix =
    normalized === ""
      ? ""
      : normalized.startsWith("/")
        ? normalized
        : `/${normalized}`
  return `${resolveWebAppOrigin()}/${lang}${suffix}`
}
