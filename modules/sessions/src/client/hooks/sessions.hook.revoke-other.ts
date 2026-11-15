"use client"

import { runAuthMutation } from "@modules/auth"
import { authClient } from "@packages/better-auth/client"
import { useMutation, useQueryClient } from "@packages/react-query"
import { sessionKey } from "./sessions.hooks.keys"

export function useRevokeOtherSessions(userId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      await runAuthMutation(
        () => authClient.revokeOtherSessions(),
        "Could not revoke other sessions"
      )
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: sessionKey(userId) }),
  })
}
