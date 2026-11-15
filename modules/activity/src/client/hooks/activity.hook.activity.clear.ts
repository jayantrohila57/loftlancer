"use client"

import {
  invokeIdempotentSecurityMutation,
  securityRpc,
} from "@modules/security/client"
import { useMutation, useQueryClient } from "@packages/react-query"
import type { ActivityClearPayload } from "../../utils/validation/activity.events.schema"

export function useClearActivity(userId: string | undefined) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (payload: ActivityClearPayload) =>
      invokeIdempotentSecurityMutation(() =>
        securityRpc.security.activity.clear({ payload })
      ),
    onSuccess: (result) =>
      result.status === "success"
        ? client.invalidateQueries({
            queryKey: ["security", "activity", userId],
          })
        : undefined,
  })
}
