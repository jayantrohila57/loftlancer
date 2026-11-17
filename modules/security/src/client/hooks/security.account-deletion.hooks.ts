"use client"

import { securityRpc } from "@modules/security/client"
import { useQuery } from "@packages/react-query"
import { useDeleteAccount } from "./security.hook.delete-account"

export const useSecurityAccountDeletionApi = {
  useDelete: useDeleteAccount,
  useStatus(userId: string | undefined) {
    return useQuery({
      queryKey: ["security", "accountDeletion", "status", userId],
      enabled: Boolean(userId),
      queryFn: async () => {
        const result = await securityRpc.security.accountDeletion.status()
        if (result.status !== "success") {
          throw new Error(result.message || "Could not load deletion status")
        }
        return result.data
      },
    })
  },
}
