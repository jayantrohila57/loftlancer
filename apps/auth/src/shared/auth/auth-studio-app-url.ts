import { serverEnv } from "@packages/t3-env/server"

/** Absolute Studio app origin (includes path-style basePath when configured). */
export function resolveStudioAppOrigin(): string {
  const development = serverEnv.NODE_ENV !== "production"
  const fallback = development
    ? "http://localhost:3003"
    : new URL("/studio", serverEnv.BETTER_AUTH_URL).toString()
  return (serverEnv.STUDIO_APP_URL ?? fallback).replace(/\/$/, "")
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
