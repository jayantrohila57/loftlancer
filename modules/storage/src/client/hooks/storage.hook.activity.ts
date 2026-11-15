"use client"

import { isTransientError } from "@modules/auth"
import { useQuery } from "@packages/react-query"

import { fetchStorageActivity } from "./storage.hook.activity-query"
import { storageActivityKey } from "./storage.hooks.keys"

export function useStorageActivity(organizationId: string | null | undefined) {
  return useQuery({
    queryKey: storageActivityKey(organizationId),
    enabled: Boolean(organizationId),
    queryFn: () => fetchStorageActivity(),
    retry: (failureCount, error) => isTransientError(error) && failureCount < 2,
    retryDelay: (attempt) => Math.min(1_000, 250 * 2 ** attempt),
  })
}
