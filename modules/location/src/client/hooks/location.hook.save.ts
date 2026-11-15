"use client"
import { securityRpc } from "@modules/security/client"
import { useMutation, useQueryClient } from "@packages/react-query"
import type { LocationInput } from "../../utils/types/location.types"
export function useSaveLocation() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: LocationInput) =>
      securityRpc.security.location.save({ payload: input }),
    onSuccess: (result) =>
      result.status === "success"
        ? client.invalidateQueries({ queryKey: ["security", "location"] })
        : undefined,
  })
}
