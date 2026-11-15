"use client"

import { isTransientError } from "@modules/auth"
import { securityRpc } from "@modules/security/client"
import { useQuery, useQueryClient } from "@packages/react-query"
import { fetchStorageTrash } from "./storage.hook.trash-query"
import { storageTrashKey } from "./storage.hooks.keys"

export function useStorageTrash(organizationId: string | null | undefined) {
  return useQuery({
    queryKey: storageTrashKey(organizationId),
    enabled: Boolean(organizationId),
    queryFn: fetchStorageTrash,
    retry: (failureCount, error) => isTransientError(error) && failureCount < 2,
    retryDelay: (attempt) => Math.min(1_000, 250 * 2 ** attempt),
  })
}

export function useRestoreStorageItem(
  organizationId: string | null | undefined
) {
  const client = useQueryClient()
  return async (itemId: string) => {
    const response = await securityRpc.security.storage.restoreItem({ itemId })
    if (response.status !== "success") {
      throw new Error(response.message)
    }
    await Promise.all([
      client.invalidateQueries({ queryKey: storageTrashKey(organizationId) }),
      client.invalidateQueries({
        queryKey: ["storage", "list", organizationId],
      }),
      client.invalidateQueries({
        queryKey: ["storage", "overview", organizationId],
      }),
    ])
    return response.data
  }
}

export function usePurgeStorageItem(organizationId: string | null | undefined) {
  const client = useQueryClient()
  return async (itemId: string) => {
    const response = await securityRpc.security.storage.purgeItem({ itemId })
    if (response.status !== "success") {
      throw new Error(response.message)
    }
    await Promise.all([
      client.invalidateQueries({ queryKey: storageTrashKey(organizationId) }),
      client.invalidateQueries({
        queryKey: ["storage", "overview", organizationId],
      }),
      client.invalidateQueries({
        queryKey: ["storage", "activity", organizationId],
      }),
    ])
    return response.data
  }
}
