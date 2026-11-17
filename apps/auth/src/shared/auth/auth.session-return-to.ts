import "server-only"

import { getPostSignInDestination } from "@/shared/auth/auth.destination"
import { serverEnv } from "@/shared/config/auth.server-env"
import type { I18nLocale } from "@/shared/i18n/auth.i18n"

const AUTH_RETURN_TO_HEADER = "x-auth-return-to-path"

function normalizeAuthRequestPath(
  lang: I18nLocale,
  requestPath: string | null | undefined
): string | undefined {
  if (!requestPath?.trim()) return undefined
  const trimmed = requestPath.trim()
  const authBase = new URL(serverEnv.BETTER_AUTH_URL).pathname.replace(
    /\/$/,
    ""
  )
  const withBase = trimmed.startsWith("/") ? trimmed : `/${trimmed}`
  const candidate =
    authBase && !withBase.startsWith(`${authBase}/`) && withBase.startsWith("/")
      ? `${authBase}${withBase}`
      : withBase
  return getPostSignInDestination(lang, candidate)
}

export function resolveRequestReturnTo(
  lang: I18nLocale,
  requestPath: string | null | undefined
): string | undefined {
  return normalizeAuthRequestPath(lang, requestPath)
}

export function resolveRefererReturnTo(
  lang: I18nLocale,
  referer: string | null | undefined
): string | undefined {
  if (!referer) return undefined
  try {
    const ref = new URL(referer)
    const auth = new URL(serverEnv.BETTER_AUTH_URL)
    if (ref.origin !== auth.origin) return undefined
    const candidate = `${ref.pathname}${ref.search}${ref.hash}`
    return getPostSignInDestination(lang, candidate)
  } catch {
    return undefined
  }
}

export { AUTH_RETURN_TO_HEADER }
