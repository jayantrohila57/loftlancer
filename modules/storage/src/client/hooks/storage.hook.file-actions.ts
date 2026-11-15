"use client"

import { securityRpc } from "@modules/security/client"
import { useQueryClient } from "@packages/react-query"

import { callStorageRpc } from "./storage.hook.rpc"
import {
  storageListKey,
  storageOverviewKey,
  storageTrashKey,
} from "./storage.hooks.keys"

export function useStorageFileActions(
  organizationId: string | null | undefined,
  folderId: string | undefined
) {
  const client = useQueryClient()

  async function invalidateLists() {
    await Promise.all([
      client.invalidateQueries({
        queryKey: storageListKey(organizationId, folderId),
      }),
      client.invalidateQueries({
        queryKey: storageListKey(organizationId, undefined),
      }),
      client.invalidateQueries({
        queryKey: storageOverviewKey(organizationId),
      }),
      client.invalidateQueries({ queryKey: storageTrashKey(organizationId) }),
      client.invalidateQueries({
        queryKey: ["storage", "activity", organizationId],
      }),
    ])
  }

  return {
    async trashItem(itemId: string) {
      await callStorageRpc(() =>
        securityRpc.security.storage.trashItem({ itemId })
      )
      await invalidateLists()
    },
    async purgeItem(itemId: string) {
      await callStorageRpc(() =>
        securityRpc.security.storage.purgeItem({ itemId })
      )
      await invalidateLists()
    },
  }
}
