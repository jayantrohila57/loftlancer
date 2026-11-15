import "server-only"

import { getPostSignInDestination } from "@/shared/auth/auth.destination"
import { serverEnv } from "@/shared/config/auth.server-env"
import type { I18nLocale } from "@/shared/i18n/auth.i18n"

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
