"use client"
import { runAuthMutation } from "@modules/auth"
import { authClient } from "@packages/better-auth/client"
import { useMutation, useQueryClient } from "@packages/react-query"
import { sessionKey } from "./sessions.hooks.keys"
export function useRevokeSession(userId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (token: string) => {
      await runAuthMutation(
        () => authClient.revokeSession({ token }),
        "Could not revoke session"
      )
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: sessionKey(userId) }),
  })
}
