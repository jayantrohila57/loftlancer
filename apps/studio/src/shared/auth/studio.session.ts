import "server-only"

import { redirectToExternalDestination } from "@features/i18n/redirect-external"
import { getAuth, getSessionCookie } from "@packages/better-auth"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { connection } from "next/server"
import { serverEnv } from "@/shared/config/studio.server-env"
import { isReservedStudioOrgSlug } from "@/shared/org/studio-org.paths"
import type { StudioUserOrganization } from "@/shared/org/studio-org.server"
import {
  listStudioUserOrganizations,
  resolveStudioOrganizationMembership,
  setStudioActiveOrganization,
} from "@/shared/org/studio-org.server"

export type StudioSession = NonNullable<
  Awaited<ReturnType<typeof requireStudioAccess>>
>

export async function requireStudioAccess(
  lang: string,
  options?: { readonly returnPath?: string }
) {
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
    const returnPath = options?.returnPath
    login.searchParams.set(
      "returnTo",
      new URL(
        returnPath
          ? `${appRoot}${returnPath.startsWith("/") ? "" : "/"}${returnPath}`
          : `${appRoot}/${lang}`,
        appUrl.origin
      ).toString()
    )
    redirectToExternalDestination(login.toString())
  }
  return session
}

export async function listStudioOrganizationsForSession(lang: string) {
  const session = await requireStudioAccess(lang)
  const organizations = await listStudioUserOrganizations(session.user.id)
  return { session, organizations }
}

export async function requireStudioOrganization(
  lang: string,
  slug: string
): Promise<{
  session: StudioSession
  organization: StudioUserOrganization
}> {
  if (isReservedStudioOrgSlug(slug)) notFound()
  const session = await requireStudioAccess(lang, {
    returnPath: `/${lang}/${slug}`,
  })
  const organization = await resolveStudioOrganizationMembership(
    session.user.id,
    slug
  )
  if (!organization) notFound()
  const activeId =
    "activeOrganizationId" in session.session
      ? session.session.activeOrganizationId
      : null
  if (activeId !== organization.id) {
    await setStudioActiveOrganization(organization.id)
  }
  return { session, organization }
}
