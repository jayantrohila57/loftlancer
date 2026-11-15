"use client"
import { isTransientAuthFailure, isTransientError } from "@modules/auth"
import { authClient } from "@packages/better-auth/client"
import { useMutation, useQueryClient } from "@packages/react-query"
import { fetchConnectedAccounts } from "./connected-accounts.hook.list-query"
import { accountsKey } from "./connected-accounts.hooks.keys"

export function useUnlinkAccount(userId: string | undefined) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async (accountId: string) => {
      let uncertain = false
      try {
        const { error } = await authClient.unlinkAccount({ accountId })
        if (!error) return
        uncertain = isTransientAuthFailure(error)
        throw new Error(
          error.message?.trim() || "Could not disconnect provider."
        )
      } catch (error) {
        if (!uncertain && !isTransientError(error)) throw error
        try {
          const accounts = await fetchConnectedAccounts()
          if (!accounts.some((account) => account.id === accountId)) return
        } catch {
          // Preserve the original error when the outcome cannot be confirmed.
        }
        throw error
      }
    },
    onSuccess: () =>
      client.invalidateQueries({ queryKey: accountsKey(userId) }),
    onError: () => client.invalidateQueries({ queryKey: accountsKey(userId) }),
  })
}
