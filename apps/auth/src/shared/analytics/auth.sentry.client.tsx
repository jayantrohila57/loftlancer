"use client"

import { authClient } from "@packages/better-auth/client"
import { SentryIdentity } from "@packages/sentry/identity"

type SessionWithOrg = {
  readonly session?: { readonly activeOrganizationId?: string | null }
}

export function AuthSentry() {
  const { data: session, isPending } = authClient.useSession()
  const userId = session?.user.id ?? null
  const orgId =
    (session as SessionWithOrg | null)?.session?.activeOrganizationId ?? null
  const normalizedOrgId =
    typeof orgId === "string" && orgId.length > 0 ? orgId : null

  return (
    <SentryIdentity
      isSessionPending={isPending}
      orgId={normalizedOrgId}
      userId={userId}
    />
  )
}
