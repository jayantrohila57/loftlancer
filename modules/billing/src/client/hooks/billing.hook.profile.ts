"use client"

import { isTransientError } from "@modules/auth"
import { securityRpc } from "@modules/security/client"
import { useQuery } from "@packages/react-query"
import type { BillingCustomerProfileData } from "../../utils/types/billing.types.rpc"
import { useBillingOrgManageQueryEnabled } from "./billing.hook.query-enabled"
import { callBillingRpc } from "./billing.hook.rpc"
import { billingProfileKey } from "./billing.hooks.keys"

export type { BillingCustomerProfileData } from "../../utils/types/billing.types.rpc"

async function fetchBillingProfile(): Promise<BillingCustomerProfileData> {
  return callBillingRpc<BillingCustomerProfileData>(() =>
    securityRpc.security.billing.customerProfile()
  )
}

export function useBillingProfile(organizationId: string | null | undefined) {
  const queryEnabled = useBillingOrgManageQueryEnabled()
  return useQuery({
    queryKey: billingProfileKey(organizationId),
    enabled: queryEnabled,
    queryFn: () => fetchBillingProfile(),
    retry: (failureCount, error) => isTransientError(error) && failureCount < 2,
    retryDelay: (attempt) => Math.min(1_000, 250 * 2 ** attempt),
  })
}
