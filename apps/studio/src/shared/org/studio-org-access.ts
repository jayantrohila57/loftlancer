import {
  canManageOrganizationBilling,
  isOrganizationOwnerRole,
} from "@modules/org"

export type StudioOrgAccess = {
  readonly isOwner: boolean
  readonly isAdmin: boolean
  readonly canViewGeneral: boolean
  readonly canEditGeneral: boolean
  readonly canViewRoles: boolean
  readonly canManageMembers: boolean
  readonly canManageInvitations: boolean
  readonly canManageBilling: boolean
  readonly canViewBillingDetails: boolean
  readonly canViewUsage: boolean
  readonly canViewActivity: boolean
  readonly canTransferOwnership: boolean
  readonly canAccessDanger: boolean
}

/**
 * Studio UI and page rules from the member role string.
 * Owner, admin, and manager (plugin alias of admin) are privileged.
 * Unknown custom plugin roles default to member visibility.
 */
export function studioOrgRoleAccess(
  role: string | null | undefined
): StudioOrgAccess {
  const isOwner = Boolean(role && isOrganizationOwnerRole(role))
  const isAdmin = Boolean(role && canManageOrganizationBilling(role))
  return {
    isOwner,
    isAdmin,
    canViewGeneral: true,
    canEditGeneral: isAdmin,
    canViewRoles: true,
    canManageMembers: isAdmin,
    canManageInvitations: isAdmin,
    canManageBilling: isAdmin,
    canViewBillingDetails: isAdmin,
    canViewUsage: true,
    canViewActivity: true,
    canTransferOwnership: isOwner,
    canAccessDanger: isOwner,
  }
}
