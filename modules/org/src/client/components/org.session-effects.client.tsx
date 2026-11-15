"use client"

import { authClient } from "@packages/better-auth/client"
import { useQueryClient } from "@packages/react-query"
import type { ReactNode } from "react"
import { useEffect, useRef } from "react"

import { readActiveOrganizationId } from "../../utils/org.session"
import { useOrgAutoActivateSingleton } from "../hooks/org.auto-active.client"
import { invalidateOrgScopedClientCaches } from "../utils/org.switch-cache"

export function OrgSessionEffects({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const activeOrgIdRef = useRef<string | null>(null)
  const { data: session } = authClient.useSession()
  const activeOrganizationId = readActiveOrganizationId(session)

  useOrgAutoActivateSingleton()

  useEffect(() => {
    const previousId = activeOrgIdRef.current
    if (
      previousId &&
      activeOrganizationId &&
      previousId !== activeOrganizationId
    ) {
      void invalidateOrgScopedClientCaches(queryClient, {
        cancelInFlight: true,
        removeStale: true,
      })
    }
    activeOrgIdRef.current = activeOrganizationId ?? null
  }, [activeOrganizationId, queryClient])

  return children
}
