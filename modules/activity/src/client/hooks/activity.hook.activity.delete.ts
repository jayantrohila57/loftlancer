"use client"

import { securityRpc } from "@modules/security/client"
import { useMutation, useQueryClient } from "@packages/react-query"
import type { DeleteActivityPayload } from "../../utils/types/activity.types.activity"

export function useDeleteActivity(userId: string | undefined) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (kind: DeleteActivityPayload["kind"]) =>
      securityRpc.security.activity.delete({ payload: { kind } }),
    onSuccess: (result) =>
      result.status === "success"
        ? client.invalidateQueries({
            queryKey: ["security", "activity", userId],
          })
        : undefined,
  })
}
