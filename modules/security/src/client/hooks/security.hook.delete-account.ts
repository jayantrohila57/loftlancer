"use client"

import { authClient } from "@packages/better-auth/client"
import { useMutation, useQueryClient } from "@packages/react-query"

export function useDeleteAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { password?: string }) => {
      const { data, error } = await authClient.deleteUser(input)
      if (error) throw new Error(error.message || "Could not delete account")
      if (!data?.success) {
        throw new Error(data?.message || "Could not delete account")
      }
      return data
    },
    onSuccess: () => {
      queryClient.clear()
    },
  })
}
