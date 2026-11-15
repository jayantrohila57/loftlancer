"use client"

import { TransientClientError, withClientRetry } from "@modules/auth"
import { securityRpc } from "@modules/security/client"
import type { AiUsageHistoryData } from "../../utils/types/ai-usage.types.history"

export async function fetchAiUsageHistory(
  cursor?: string | null
): Promise<AiUsageHistoryData> {
  return withClientRetry(async () => {
    const response = await securityRpc.security.aiUsage.usageHistory({
      query: { cursor: cursor ?? undefined },
    })
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
