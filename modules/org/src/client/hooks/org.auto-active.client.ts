"use client"

import { authClient } from "@packages/better-auth/client"
import { useQueryClient } from "@packages/react-query"
import { useEffect, useRef } from "react"
import { readActiveOrganizationId } from "../../utils/org.session"
import { switchActiveOrganization } from "../utils/org.switch-active.client"
import { useOrgListOrganizations } from "./org.hook.list-organizations"

/**
 * When the signed-in user has exactly one membership and no active org on the session,
 * set it active so org-scoped account screens can load data.
 */
export function useOrgAutoActivateSingleton() {
  const queryClient = useQueryClient()
  const attemptedForUser = useRef<string | null>(null)
  const { data: session, isPending: sessionPending } = authClient.useSession()
  const userId = session?.user.id
  const activeId = readActiveOrganizationId(session)
  const { data: organizations, isPending: orgsPending } =
    useOrgListOrganizations()

  useEffect(() => {
    if (sessionPending || orgsPending || !userId || activeId) return
    if (!organizations?.length || organizations.length !== 1) return
    if (attemptedForUser.current === userId) return
    attemptedForUser.current = userId
    const organizationId = organizations[0]?.id
    if (!organizationId) return
    void switchActiveOrganization({
      organizationId,
      queryClient,
      switchErrorMessage: "Could not switch organization",
    }).catch(() => {
      attemptedForUser.current = null
    })
  }, [
    activeId,
    orgsPending,
    organizations,
    queryClient,
    sessionPending,
    userId,
  ])
}
