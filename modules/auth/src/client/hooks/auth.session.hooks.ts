"use client"

import { authClient } from "@packages/better-auth/client"
import { useMutation, useQueryClient } from "@packages/react-query"
import { runAuthMutation } from "../../utils/auth.client-retry"
import { capturePermittedLocation } from "./auth.permitted-location.client"
import { clearPrivateClientCache } from "./auth.private-client-identity.client"

function useSignOut() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      await capturePermittedLocation()
      await runAuthMutation(() => authClient.signOut(), "Could not sign out")
    },
    onSuccess: () => clearPrivateClientCache(queryClient),
  })
}
export const authSessionApi = { useSignOut }
