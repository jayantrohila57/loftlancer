"use client"

import { isTransientError } from "@modules/auth"
import { securityRpc } from "@modules/security/client"
import { useQuery } from "@packages/react-query"
import type { BillingInvoicesListData } from "../../utils/types/billing.types.rpc"
import { useBillingOrgManageQueryEnabled } from "./billing.hook.query-enabled"
import { callBillingRpc } from "./billing.hook.rpc"
import { billingInvoicesKey } from "./billing.hooks.keys"

async function fetchBillingInvoices(
  variant: "invoices" | "payment-history",
  cursor?: string | null
): Promise<BillingInvoicesListData> {
  if (variant === "payment-history") {
    return callBillingRpc<BillingInvoicesListData>(() =>
      securityRpc.security.billing.listPaymentHistory({ cursor })
    )
  }
  return callBillingRpc<BillingInvoicesListData>(() =>
    securityRpc.security.billing.listInvoices({ cursor })
  )
}

export function useBillingInvoices(
  organizationId: string | null | undefined,
  variant: "invoices" | "payment-history",
  cursor?: string | null
) {
  const queryEnabled = useBillingOrgManageQueryEnabled()
  return useQuery({
    queryKey: billingInvoicesKey(organizationId, variant, cursor),
    enabled: queryEnabled,
    queryFn: () => fetchBillingInvoices(variant, cursor),
    retry: (failureCount, error) => isTransientError(error) && failureCount < 2,
    retryDelay: (attempt) => Math.min(1_000, 250 * 2 ** attempt),
  })
}
