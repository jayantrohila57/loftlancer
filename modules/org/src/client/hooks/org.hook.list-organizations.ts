"use client"

import { authClient } from "@packages/better-auth/client"
import { useQuery } from "@packages/react-query"

export type OrgListedOrganization = {
  readonly id: string
  readonly name: string
  readonly slug?: string | null
}

/** Lists organizations only after `useSession` resolves a signed-in user. */
export function useOrgListOrganizations() {
  const { data: session, isPending: sessionPending } = authClient.useSession()
  const userId = session?.user.id
  const query = useQuery({
    queryKey: ["organization", "list", userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<readonly OrgListedOrganization[]> => {
      const result = await authClient.organization.list()
      if (result.error) {
        throw new Error(result.error.message?.trim() || "organizations")
      }
      return (result.data ?? []) as readonly OrgListedOrganization[]
    },
  })
  return {
    data: query.data,
    isPending: sessionPending || (Boolean(userId) && query.isPending),
    error: query.error,
    refetch: query.refetch,
  }
}
