"use client"
import { formatAuthClientError } from "@modules/auth"
import { authClient } from "@packages/better-auth/client"
import { useMutation } from "@packages/react-query"
import type { LinkAccountInput } from "../../utils/types/connected-accounts.types.providers"
export function useLinkAccount() {
  return useMutation({
    mutationFn: async (input: LinkAccountInput) => {
      const { error } = await authClient.linkSocial(input)
      if (error) {
        throw new Error(
          formatAuthClientError(error, "Could not connect provider.", {
            provider: input.provider,
          })
        )
      }
    },
  })
}
