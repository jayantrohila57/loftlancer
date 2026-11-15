"use client"

import { isTransientError } from "@modules/auth"
import { useQuery } from "@packages/react-query"
import { fetchAiUsageHistory } from "./ai-usage.hook.history-query"
import { aiUsageHistoryKey } from "./ai-usage.hooks.keys"

export function useAiUsageHistory(
  organizationId: string | null | undefined,
  cursor?: string | null
) {
  return useQuery({
    queryKey: aiUsageHistoryKey(organizationId, cursor),
    enabled: Boolean(organizationId),
    queryFn: () => fetchAiUsageHistory(cursor),
    retry: (failureCount, error) => isTransientError(error) && failureCount < 2,
    retryDelay: (attempt) => Math.min(1_000, 250 * 2 ** attempt),
  })
}
