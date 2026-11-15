"use client"
import { securityRpc } from "@modules/security/client"
import { useMutation, useQueryClient } from "@packages/react-query"
export function useDeleteLocation() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: () => securityRpc.security.location.delete(),
    onSuccess: (result) =>
      result.status === "success"
        ? client.invalidateQueries({ queryKey: ["security", "location"] })
        : undefined,
  })
}
