"use client"

import { TransientClientError, withClientRetry } from "@modules/auth"
import { securityRpc } from "@modules/security/client"
import type { z } from "zod"
import type {
  aiUsageLimitsAlertsDataSchema,
  aiUsageLimitsAlertsUpdatePayloadSchema,
} from "../../utils/validation/ai-usage.limits-alerts.schema"

type AiUsageLimitsAlertsData = z.infer<typeof aiUsageLimitsAlertsDataSchema>

async function unwrapLimits<T>(
  call: () => Promise<{
    status: string
    data?: T
    message: string
    error?: { code?: string }
  }>
) {
  return withClientRetry(async () => {
    const response = await call()
    if (response.status === "error") {
      const code = response.error?.code
      if (
        code === "SERVICE_UNAVAILABLE" ||
        code === "auth.no_active_org" ||
        code === "rbac.not_member"
      ) {
        throw new TransientClientError(
          response.message,
          response.error ?? { code: code ?? "SERVICE_UNAVAILABLE" }
        )
      }
      throw new Error(response.message)
    }
    if (response.status === "failed" || !response.data) {
      throw new Error(response.message)
    }
    return response.data
  })
}

export async function fetchAiUsageLimitsAlerts(): Promise<AiUsageLimitsAlertsData> {
  return unwrapLimits(() => securityRpc.security.aiUsage.limitsAlertsGet())
}

export async function updateAiUsageLimitsAlerts(
  payload: z.infer<typeof aiUsageLimitsAlertsUpdatePayloadSchema>
): Promise<AiUsageLimitsAlertsData> {
  return unwrapLimits(() =>
    securityRpc.security.aiUsage.limitsAlertsUpdate({ payload })
  )
}
