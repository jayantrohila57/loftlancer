"use client"
import { securityRpc } from "@modules/security/client"
import { useMutation, useQueryClient } from "@packages/react-query"
export function useLocationPreference() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (enabled: boolean) =>
      securityRpc.security.location.preference({ payload: { enabled } }),
    onSuccess: (result) =>
      result.status === "success"
        ? client.invalidateQueries({ queryKey: ["security", "location"] })
        : undefined,
  })
}
