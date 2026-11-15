"use client"

import { isTransientError } from "@modules/auth"
import { useQuery } from "@packages/react-query"
import { fetchStorageList } from "./storage.hook.list-query"
import { storageListKey } from "./storage.hooks.keys"

export function useStorageList(
  organizationId: string | null | undefined,
  folderId?: string
) {
  return useQuery({
    queryKey: storageListKey(organizationId, folderId),
    enabled: Boolean(organizationId),
    queryFn: () => fetchStorageList(folderId ? { folderId } : undefined),
    retry: (failureCount, error) => isTransientError(error) && failureCount < 2,
    retryDelay: (attempt) => Math.min(1_000, 250 * 2 ** attempt),
  })
}
