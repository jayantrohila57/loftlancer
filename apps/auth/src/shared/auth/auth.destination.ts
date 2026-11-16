import "server-only"

import { defaultSupportedLocales } from "@features/i18n/constants"
import { serverEnv } from "@packages/t3-env/server"

const localeSegment = defaultSupportedLocales.join("|")
const authEntryPattern = new RegExp(
  `^/(${localeSegment})(?:/|$)(account|organizations|sign-in|continue|welcome|first-login|device|check-email|consent|error|unauthorized)(?:/|$)`
)
const authLoopPattern = new RegExp(
  `^/(${localeSegment})(?:/(?:sign-in|continue))?/?$`
)

function returnToContainsControlCharacter(value: string): boolean {
  for (const char of value) {
    const code = char.codePointAt(0)
    if (code !== undefined && (code <= 0x1f || code === 0x7f)) return true
  }
  return false
}

function returnToContainsParentPathSegment(value: string): boolean {
  const path = value.split("#", 1)[0]?.split("?", 1)[0] ?? value
  if (/(?:^|\/)\.\.(?:\/|$)/.test(path)) return true
  if (/(?:^|\/|%2f|%2F)(?:%2e%2e|%2E%2E)(?:\/|$|%2f|%2F)/i.test(path))
    return true
  if (/(?:^|\/)\.\.(?:%2f|%2F|%5c|%5C)/i.test(path)) return true
  if (
    /(?:%2f|%2F|%5c|%5C)(?:%2e%2e|%2E%2E|\.\.)(?:%2f|%2F|%5c|%5C|$)/i.test(path)
  )
    return true
  return false
}

function resolvedPathContainsParentHop(pathname: string): boolean {
  for (const segment of pathname.split("/")) {
    if (!segment) continue
    if (segment === "..") return true
    if (/%2e%2e/i.test(segment)) return true
    let decoded = segment
    try {
      decoded = decodeURIComponent(segment)
    } catch {
      return true
    }
    if (decoded === ".." || /\.\.(?:\/|\\)/.test(decoded)) return true
  }
  return false
}

function appRootMatches(target: URL, root: URL): boolean {
  const path = root.pathname.replace(/\/$/, "")
  return (
    target.origin === root.origin &&
    (!path ||
      target.pathname === path ||
      target.pathname.startsWith(`${path}/`))
  )
}

/** Restrict post-login destinations to explicitly configured application roots. */
export function getPostSignInDestination(lang: string, value?: string): string {
  const auth = new URL(serverEnv.BETTER_AUTH_URL)
  const development = serverEnv.NODE_ENV !== "production"
  const studio = new URL(
    serverEnv.STUDIO_APP_URL ??
      (development ? "http://localhost:3003" : "/studio"),
    auth.origin
  )
  const consoleApp = new URL(
    serverEnv.CONSOLE_APP_URL ??
      (development ? "http://localhost:3004" : "/console"),
    auth.origin
  )
  const web = new URL(
    serverEnv.WEB_APP_URL ??
      serverEnv.APP_PUBLIC_URL ??
      (development ? "http://localhost:3001" : "/"),
    auth.origin
  )
  const allowed = [studio, consoleApp, auth, web]
  const authBase = auth.pathname.replace(/\/$/, "")
  const fallback = new URL(
    `${studio.pathname.replace(/\/$/, "")}/${lang}`,
    studio.origin
  ).toString()
  if (!value) return fallback
  const trimmed = value.trim()
  if (
    !trimmed ||
    returnToContainsControlCharacter(trimmed) ||
    returnToContainsParentPathSegment(trimmed)
  )
    return fallback
  try {
    let target = new URL(trimmed, auth.origin)
    if (
      target.username ||
      target.password ||
      !["http:", "https:"].includes(target.protocol) ||
      resolvedPathContainsParentHop(target.pathname)
    )
      return fallback
    if (
      authBase &&
      target.origin === auth.origin &&
      !target.pathname.startsWith(`${authBase}/`) &&
      authEntryPattern.test(target.pathname)
    ) {
      target = new URL(
        `${authBase}${target.pathname}${target.search}${target.hash}`,
        target.origin
      )
    }
    if (
      target.origin === auth.origin &&
      (authBase === "" || target.pathname.startsWith(`${authBase}/`)) &&
      authLoopPattern.test(target.pathname.slice(authBase.length))
    )
      return fallback
    const matches = allowed.some((root) => appRootMatches(target, root))
    return matches ? target.toString() : fallback
  } catch {
    return fallback
  }
}

function resolveWebAppRoot(): URL {
  const auth = new URL(serverEnv.BETTER_AUTH_URL)
  const development = serverEnv.NODE_ENV !== "production"
  return new URL(
    serverEnv.WEB_APP_URL ??
      serverEnv.APP_PUBLIC_URL ??
      (development ? "http://localhost:3001" : "/"),
    auth.origin
  )
}

/** Marketing checkout return URLs must stay on the configured web app origin. */
export function isAllowedBillingReturnUrl(value: string): boolean {
  const trimmed = value.trim()
  if (
    !trimmed ||
    returnToContainsControlCharacter(trimmed) ||
    returnToContainsParentPathSegment(trimmed)
  ) {
    return false
  }
  try {
    const target = new URL(trimmed)
    if (
      target.username ||
      target.password ||
      !["http:", "https:"].includes(target.protocol) ||
      resolvedPathContainsParentHop(target.pathname)
    ) {
      return false
    }
    return appRootMatches(target, resolveWebAppRoot())
  } catch {
    return false
  }
}
