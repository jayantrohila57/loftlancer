import {
  canManageOrganizationBilling,
  canViewOrganizationBilling,
} from "@modules/org"

export type BillingOrgOwnerQueryInput = {
  organizationId: string | null | undefined
  role: string | null | undefined
  rolePending: boolean
}

export function isBillingOrgViewQueryEnabled(input: BillingOrgOwnerQueryInput) {
  if (!input.organizationId || input.rolePending || !input.role) return false
  return canViewOrganizationBilling(input.role)
}

export function isBillingOrgManageQueryEnabled(
  input: BillingOrgOwnerQueryInput
) {
  if (!input.organizationId || input.rolePending || !input.role) return false
  return canManageOrganizationBilling(input.role)
}

/** @deprecated Use {@link isBillingOrgManageQueryEnabled}. */
export function isBillingOrgOwnerQueryEnabled(
  input: BillingOrgOwnerQueryInput
) {
  return isBillingOrgManageQueryEnabled(input)
}
