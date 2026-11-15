import "server-only"

import { redirectToExternalDestination } from "@features/i18n/redirect-external"
import { isPlatformAdminEmail, userHasAdminRole } from "@modules/admin"
import { getAuth, getSessionCookie } from "@packages/better-auth"
import { headers } from "next/headers"
import { connection } from "next/server"
import { serverEnv } from "@/shared/config/console.server-env"

export async function requireConsoleAccess(lang: string) {
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
  const role =
    "role" in session.user
      ? (session.user as { role?: string | null }).role
      : undefined
  if (
    !session.user.emailVerified ||
    !isPlatformAdminEmail(session.user.email) ||
    !userHasAdminRole(role)
  ) {
    const denied = new URL(
      `${serverEnv.BETTER_AUTH_URL.replace(/\/$/, "")}/${lang}/unauthorized`
    )
    denied.searchParams.set("reason", "console_access_denied")
    redirectToExternalDestination(denied.toString())
  }
  return session
}
