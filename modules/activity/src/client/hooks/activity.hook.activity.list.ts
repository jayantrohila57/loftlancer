"use client"

import { securityRpc } from "@modules/security/client"
import { useQuery } from "@packages/react-query"
import type { ListActivityQuery } from "../../utils/types/activity.types.activity"

export function useListActivity(
  userId: string | undefined,
  input: ListActivityQuery
) {
  return useQuery({
    queryKey: ["security", "activity", userId, input],
    enabled: Boolean(userId),
    queryFn: () => securityRpc.security.activity.list({ query: input }),
  })
}
