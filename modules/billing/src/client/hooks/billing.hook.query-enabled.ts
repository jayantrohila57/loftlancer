"use client"

import { useOrgActiveMemberRole, useOrgSessionActiveId } from "@modules/org"

import { isBillingOrgOwnerQueryEnabled } from "../../utils/billing.query-enabled"

/** True when billing oRPC may run: active org and confirmed organization owner. */
export function useBillingOrgOwnerQueryEnabled() {
  const organizationId = useOrgSessionActiveId()
  const { role, isPending } = useOrgActiveMemberRole()
  return isBillingOrgOwnerQueryEnabled({
    organizationId,
    role,
    rolePending: isPending,
  })
}
