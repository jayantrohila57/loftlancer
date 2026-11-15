"use client"

import { TransientClientError, withClientRetry } from "@modules/auth"
import { securityRpc } from "@modules/security/client"
import type { BillingOverviewData } from "../../utils/types/billing.types.overview"

export async function fetchBillingOverview(): Promise<BillingOverviewData> {
  return withClientRetry(async () => {
    const response = await securityRpc.security.billing.overview()
    if (response.status === "error") {
      const code = response.error?.code
      if (
        code === "billing.entitlement_missing" ||
        code === "auth.no_active_org" ||
        code === "rbac.not_member" ||
        code === "rbac.org_owner_required"
      ) {
        throw new TransientClientError(
          response.message,
          response.error ?? { code: code ?? "billing.unavailable" }
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
