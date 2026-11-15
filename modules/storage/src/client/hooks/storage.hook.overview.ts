"use client"

import { isTransientError } from "@modules/auth"
import { useQuery } from "@packages/react-query"
import { fetchStorageOverview } from "./storage.hook.overview-query"
import { storageOverviewKey } from "./storage.hooks.keys"

export function useStorageOverview(organizationId: string | null | undefined) {
  return useQuery({
    queryKey: storageOverviewKey(organizationId),
    enabled: Boolean(organizationId),
    queryFn: () => fetchStorageOverview(),
    retry: (failureCount, error) => isTransientError(error) && failureCount < 2,
    retryDelay: (attempt) => Math.min(1_000, 250 * 2 ** attempt),
  })
}
