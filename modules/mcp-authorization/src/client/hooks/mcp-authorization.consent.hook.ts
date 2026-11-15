"use client"

import { decideOAuthConsent } from "@packages/better-auth/client"
import { useMutation } from "@packages/react-query"

export function useMcpOAuthConsentDecision() {
  return useMutation({
    mutationFn: async (accept: boolean) => {
      const response = await decideOAuthConsent(accept)
      if (response.error) {
        throw new Error(response.error.message ?? "Authorization failed.")
      }
      const redirectUrl = response.data?.url
      if (redirectUrl) {
        window.location.assign(redirectUrl)
      }
      return response.data
    },
  })
}
