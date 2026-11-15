"use client"
import { securityRpc } from "@modules/security/client"
import { useQuery } from "@packages/react-query"
export function useProviders(userId: string | undefined) {
  return useQuery({
    queryKey: ["security", "providers", userId],
    enabled: Boolean(userId),
    queryFn: () => securityRpc.security.providers.list(),
  })
}
