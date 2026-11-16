"use client"

import { isTransientError } from "@modules/auth"
import { securityRpc } from "@modules/security/client"
import { useQuery } from "@packages/react-query"
import type { BillingPlansData } from "../../utils/types/billing.types.rpc"
import { useBillingOrgViewQueryEnabled } from "./billing.hook.query-enabled"
import { callBillingRpc } from "./billing.hook.rpc"
import { billingPlansKey } from "./billing.hooks.keys"

export type { BillingPlansData } from "../../utils/types/billing.types.rpc"

async function fetchBillingPlans(): Promise<BillingPlansData> {
  return callBillingRpc<BillingPlansData>(() =>
    securityRpc.security.billing.listPlans()
  )
}

export function useBillingPlans(organizationId: string | null | undefined) {
  const queryEnabled = useBillingOrgViewQueryEnabled()
  return useQuery({
    queryKey: billingPlansKey(organizationId),
    enabled: queryEnabled,
    queryFn: () => fetchBillingPlans(),
    retry: (failureCount, error) => isTransientError(error) && failureCount < 2,
    retryDelay: (attempt) => Math.min(1_000, 250 * 2 ** attempt),
  })
}
