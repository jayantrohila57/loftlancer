/**
 * Read Studio URL vars from `process.env` (not `@packages/t3-env/server`) so
 * `next.config.ts` can import this module. Next's config transpiler rewrites
 * workspace package imports relative to `next.config.ts`, which breaks when
 * the same specifier is required from a nested source file.
 */
export function resolveStudioAppOrigin(): string {
  const development = process.env.NODE_ENV !== "production"
  const authUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3002/auth"
  const fallback = development
    ? "http://localhost:3003"
    : new URL("/studio", authUrl).toString()
  return (process.env.STUDIO_APP_URL ?? fallback).replace(/\/$/, "")
}

export function buildStudioLocalePath(lang: string, path: string): string {
  const normalized = path.trim()
  const suffix =
    normalized === ""
      ? ""
      : normalized.startsWith("/")
        ? normalized
        : `/${normalized}`
  return `${resolveStudioAppOrigin()}/${lang}${suffix}`
}
