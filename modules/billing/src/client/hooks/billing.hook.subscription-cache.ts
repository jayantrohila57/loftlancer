"use client"

import type { QueryClient } from "@packages/react-query"
import { useQueryClient } from "@packages/react-query"

import { billingOverviewKey, billingPlansKey } from "./billing.hooks.keys"

export function invalidateBillingSubscriptionQueries(
  client: QueryClient,
  organizationId: string | null | undefined
) {
  return Promise.all([
    client.invalidateQueries({
      queryKey: billingOverviewKey(organizationId),
    }),
    client.invalidateQueries({
      queryKey: billingPlansKey(organizationId),
    }),
  ])
}

export function useInvalidateBillingSubscriptionQueries(
  organizationId: string | null | undefined
) {
  const client = useQueryClient()
  return () => invalidateBillingSubscriptionQueries(client, organizationId)
}
