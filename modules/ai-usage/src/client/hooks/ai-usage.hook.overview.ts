"use client"

import { isTransientError } from "@modules/auth"
import { useQuery } from "@packages/react-query"
import { fetchAiUsageOverview } from "./ai-usage.hook.overview-query"
import { aiUsageOverviewKey } from "./ai-usage.hooks.keys"

export function useAiUsageOverview(organizationId: string | null | undefined) {
  return useQuery({
    queryKey: aiUsageOverviewKey(organizationId),
    enabled: Boolean(organizationId),
    queryFn: () => fetchAiUsageOverview(),
    retry: (failureCount, error) => isTransientError(error) && failureCount < 2,
    retryDelay: (attempt) => Math.min(1_000, 250 * 2 ** attempt),
  })
}
