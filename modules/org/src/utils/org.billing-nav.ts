import { canViewOrganizationBilling } from "./org.member-role"

export type OrgBillingNavVisibilityInput = {
  role: string | null | undefined
  rolePending: boolean
}

/** Sidebar shows billing links while role is loading; hides them when billing cannot be viewed. */
export function resolveOrgBillingNavVisible(
  input: OrgBillingNavVisibilityInput
) {
  if (input.rolePending) return true
  return Boolean(input.role && canViewOrganizationBilling(input.role))
}
