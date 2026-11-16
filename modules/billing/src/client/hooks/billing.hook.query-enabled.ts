"use client"

import { useOrgActiveMemberRole, useOrgSessionActiveId } from "@modules/org"

import {
  isBillingOrgManageQueryEnabled,
  isBillingOrgViewQueryEnabled,
} from "../../utils/billing.query-enabled"

/** True when billing read oRPC may run. */
export function useBillingOrgViewQueryEnabled() {
  const organizationId = useOrgSessionActiveId()
  const { role, isPending } = useOrgActiveMemberRole()
  return isBillingOrgViewQueryEnabled({
    organizationId,
    role,
    rolePending: isPending,
  })
}

/** True when billing mutation oRPC may run. */
export function useBillingOrgManageQueryEnabled() {
  const organizationId = useOrgSessionActiveId()
  const { role, isPending } = useOrgActiveMemberRole()
  return isBillingOrgManageQueryEnabled({
    organizationId,
    role,
    rolePending: isPending,
  })
}

/** @deprecated Use {@link useBillingOrgManageQueryEnabled}. */
export function useBillingOrgOwnerQueryEnabled() {
  return useBillingOrgManageQueryEnabled()
}
