import { isOrganizationOwnerRole } from "./org.member-role"

export type OrgBillingNavVisibilityInput = {
  role: string | null | undefined
  rolePending: boolean
}

/** Sidebar shows billing links while role is loading; hides them for non-owners. */
export function resolveOrgBillingNavVisible(
  input: OrgBillingNavVisibilityInput
) {
  if (input.rolePending) return true
  return Boolean(input.role && isOrganizationOwnerRole(input.role))
}
