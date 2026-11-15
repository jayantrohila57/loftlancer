"use client"

import { TransientClientError, withClientRetry } from "@modules/auth"
import { securityRpc } from "@modules/security/client"
import type { AiUsageOverviewData } from "../../utils/types/ai-usage.types.overview"

export async function fetchAiUsageOverview(): Promise<AiUsageOverviewData> {
  return withClientRetry(async () => {
    const response = await securityRpc.security.aiUsage.overview()
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
