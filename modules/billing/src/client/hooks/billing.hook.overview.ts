"use client"

import { isTransientError } from "@modules/auth"
import { useQuery } from "@packages/react-query"
import { fetchBillingOverview } from "./billing.hook.overview-query"
import { useBillingOrgViewQueryEnabled } from "./billing.hook.query-enabled"
import { billingOverviewKey } from "./billing.hooks.keys"

export function useBillingOverview(organizationId: string | null | undefined) {
  const queryEnabled = useBillingOrgViewQueryEnabled()
  return useQuery({
    queryKey: billingOverviewKey(organizationId),
    enabled: queryEnabled,
    queryFn: () => fetchBillingOverview(),
    retry: (failureCount, error) => isTransientError(error) && failureCount < 2,
    retryDelay: (attempt) => Math.min(1_000, 250 * 2 ** attempt),
  })
}
