"use client"

import { isTransientError } from "@modules/auth"
import { securityRpc } from "@modules/security/client"
import { useQuery, useQueryClient } from "@packages/react-query"

import { callStorageRpc } from "./storage.hook.rpc"
import { storageGrantsKey } from "./storage.hooks.keys"

async function fetchStorageGrants() {
  return callStorageRpc(() => securityRpc.security.storage.listGrants())
}

export function useStorageGrants(
  organizationId: string | null | undefined,
  enabled = true
) {
  return useQuery({
    queryKey: storageGrantsKey(organizationId),
    enabled: Boolean(organizationId) && enabled,
    queryFn: fetchStorageGrants,
    retry: (failureCount, error) => isTransientError(error) && failureCount < 2,
    retryDelay: (attempt) => Math.min(1_000, 250 * 2 ** attempt),
  })
}

export function useStorageGrantMutations(
  organizationId: string | null | undefined
) {
  const client = useQueryClient()

  async function invalidate() {
    await client.invalidateQueries({
      queryKey: storageGrantsKey(organizationId),
    })
    await client.invalidateQueries({
      queryKey: ["storage", "list", organizationId],
    })
  }

  return {
    async createGrant(input: {
      userId: string
      folderId?: string
      itemId?: string
      includesDescendants?: boolean
    }) {
      await callStorageRpc(() =>
        securityRpc.security.storage.createGrant(input)
      )
      await invalidate()
    },
    async revokeGrant(grantId: string) {
      await callStorageRpc(() =>
        securityRpc.security.storage.revokeGrant({ grantId })
      )
      await invalidate()
    },
  }
}
