import "server-only"

import { redirectToExternalDestination } from "@features/i18n/redirect-external"
import { getAuth, getSessionCookie } from "@packages/better-auth"
import { headers } from "next/headers"
import { connection } from "next/server"
import { serverEnv } from "@/shared/config/studio.server-env"

export async function requireStudioAccess(lang: string) {
  // Better Auth reads `crypto.getRandomValues()` while resolving the session.
  await connection()
  const requestHeaders = await headers()
  const session = getSessionCookie(requestHeaders)
    ? await getAuth().api.getSession({ headers: requestHeaders })
    : null
  if (!session?.user || !session.session) {
    const login = new URL(
      `${serverEnv.BETTER_AUTH_URL.replace(/\/$/, "")}/${lang}/sign-in`
    )
    const appUrl = new URL(serverEnv.APP_PUBLIC_URL)
    const appRoot = appUrl.pathname.replace(/\/$/, "")
    login.searchParams.set(
      "returnTo",
      new URL(`${appRoot}/${lang}`, appUrl.origin).toString()
    )
    redirectToExternalDestination(login.toString())
  }
  return session
}
