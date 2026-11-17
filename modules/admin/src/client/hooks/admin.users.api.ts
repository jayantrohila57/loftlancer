"use client"

import { throwOnServiceResponseFailure } from "@modules/auth"
import { securityRpc } from "@modules/security/client"
import { useMutation, useQueryClient } from "@packages/react-query"

export function useAdminBanUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      userId: string
      banReason?: string
      banExpiresAt?: Date
    }) => {
      const response = await securityRpc.security.admin.users.ban(input)
      throwOnServiceResponseFailure(response)
      return response.data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
    },
  })
}

export function useAdminUnbanUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { userId: string }) => {
      const response = await securityRpc.security.admin.users.unban(input)
      throwOnServiceResponseFailure(response)
      return response.data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
    },
  })
}
