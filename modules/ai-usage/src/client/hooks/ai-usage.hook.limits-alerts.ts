"use client"

import { isTransientError } from "@modules/auth"
import { useMutation, useQuery, useQueryClient } from "@packages/react-query"
import type { z } from "zod"

import type { aiUsageLimitsAlertsUpdatePayloadSchema } from "../../utils/validation/ai-usage.limits-alerts.schema"
import {
  fetchAiUsageLimitsAlerts,
  updateAiUsageLimitsAlerts,
} from "./ai-usage.hook.limits-alerts-query"
import { aiUsageLimitsAlertsKey } from "./ai-usage.hooks.keys"

export function useAiUsageLimitsAlerts(
  organizationId: string | null | undefined
) {
  return useQuery({
    queryKey: aiUsageLimitsAlertsKey(organizationId),
    enabled: Boolean(organizationId),
    queryFn: () => fetchAiUsageLimitsAlerts(),
    retry: (failureCount, error) => isTransientError(error) && failureCount < 2,
    retryDelay: (attempt) => Math.min(1_000, 250 * 2 ** attempt),
  })
}

export function useAiUsageLimitsAlertsUpdate(
  organizationId: string | null | undefined
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (
      payload: z.infer<typeof aiUsageLimitsAlertsUpdatePayloadSchema>
    ) => updateAiUsageLimitsAlerts(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(aiUsageLimitsAlertsKey(organizationId), data)
    },
  })
}
