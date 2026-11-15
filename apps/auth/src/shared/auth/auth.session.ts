import "server-only"

import "@/shared/auth/auth.bootstrap"

import { redirectToExternalDestination } from "@features/i18n/redirect-external"
import { getAuth, getSessionCookie } from "@packages/better-auth"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { connection } from "next/server"
import { hasLocale } from "next-intl"
import { cache } from "react"
import { getPostSignInDestination } from "@/shared/auth/auth.destination"
import { resolveRefererReturnTo } from "@/shared/auth/auth.session-return-to"
import type { I18nLocale } from "@/shared/i18n/auth.i18n"
import { appI18n, redirect } from "@/shared/i18n/auth.i18n"
import type { LangRouteParams } from "@/shared/types/auth.app.types"

/** Verify the session with Better Auth; do not treat a cookie as proof of identity. */
const getRequestSession = cache(async () => {
  // Session expiry uses `new Date()` inside Better Auth. Opt out of prerender first.
  await connection()
  const requestHeaders = await headers()
  if (!getSessionCookie(requestHeaders)) return null
  return getAuth().api.getSession({ headers: requestHeaders })
})

type RequestSession = Awaited<ReturnType<typeof getRequestSession>>
type AccountSession = NonNullable<RequestSession>

export async function readSafeReturnToForSignIn(
  lang: I18nLocale
): Promise<string | undefined> {
  const requestHeaders = await headers()
  return resolveRefererReturnTo(lang, requestHeaders.get("referer"))
}

export { resolveRefererReturnTo } from "@/shared/auth/auth.session-return-to"

async function redirectToSignIn(locale: I18nLocale): Promise<never> {
  const returnTo = await readSafeReturnToForSignIn(locale)
  const query = returnTo ? `?${new URLSearchParams({ returnTo })}` : ""
  redirect({ href: `/sign-in${query}`, locale })
  throw new Error("Unreachable sign-in redirect")
}

async function toAccountSession(
  session: RequestSession,
  locale: I18nLocale
): Promise<AccountSession> {
  if (!session?.user || !session.session) {
    return redirectToSignIn(locale)
  }
  return session
}

/** Account routes call this from `account/layout.tsx`, inside Suspense. */
export async function requireAccountSession(
  params: Promise<LangRouteParams>
): Promise<AccountSession> {
  const [{ lang }, session] = await Promise.all([params, getRequestSession()])
  if (!hasLocale(appI18n.routing.locales, lang)) notFound()
  return toAccountSession(session, lang)
}

/** Send an already signed-in visitor from the sign-in screen to their account. */
export async function redirectAuthenticatedUser(
  params: Promise<LangRouteParams>,
  returnTo?: string
) {
  const [{ lang }, session] = await Promise.all([params, getRequestSession()])
  if (session?.user && session.session)
    redirectToExternalDestination(getPostSignInDestination(lang, returnTo))
}
