import { isOrganizationOwnerRole } from "@modules/org"

export type BillingOrgOwnerQueryInput = {
  organizationId: string | null | undefined
  role: string | null | undefined
  rolePending: boolean
}

/** Matches {@link BillingAccessGate} and {@link billingOrgOwnerProcedure} policy. */
export function isBillingOrgOwnerQueryEnabled(
  input: BillingOrgOwnerQueryInput
) {
  if (!input.organizationId || input.rolePending || !input.role) return false
  return isOrganizationOwnerRole(input.role)
}
