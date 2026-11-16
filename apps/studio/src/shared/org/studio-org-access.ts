import {
  canEditOrganizationSettings,
  canManageElevatedOrganizationMembers,
  canManageOrganizationBilling,
  canManageOrganizationMembers,
  canViewOrganizationBilling,
  orgRoleHasPermission,
  resolveOrgProductRole,
} from "@modules/org"

export type StudioOrgAccess = {
  readonly productRole: ReturnType<typeof resolveOrgProductRole>
  readonly isOwner: boolean
  readonly isAdmin: boolean
  readonly isManager: boolean
  readonly canViewGeneral: boolean
  readonly canEditGeneral: boolean
  readonly canViewRoles: boolean
  readonly canManageMembers: boolean
  readonly canManageElevatedMembers: boolean
  readonly canManageInvitations: boolean
  readonly canManageBilling: boolean
  readonly canViewBilling: boolean
  readonly canViewBillingDetails: boolean
  readonly canViewUsage: boolean
  readonly canViewActivity: boolean
  readonly canTransferOwnership: boolean
  readonly canAccessDanger: boolean
}

export function studioOrgRoleAccess(
  role: string | null | undefined
): StudioOrgAccess {
  const productRole = resolveOrgProductRole(role)
  return {
    productRole,
    isOwner: productRole === "owner",
    isAdmin: productRole === "admin",
    isManager: productRole === "manager",
    canViewGeneral: orgRoleHasPermission(role, "orgSettingsView"),
    canEditGeneral: canEditOrganizationSettings(role),
    canViewRoles: orgRoleHasPermission(role, "rolesView"),
    canManageMembers: canManageOrganizationMembers(role),
    canManageElevatedMembers: canManageElevatedOrganizationMembers(role),
    canManageInvitations: orgRoleHasPermission(role, "invitationsManage"),
    canManageBilling: canManageOrganizationBilling(role),
    canViewBilling: canViewOrganizationBilling(role),
    canViewBillingDetails: canManageOrganizationBilling(role),
    canViewUsage: orgRoleHasPermission(role, "usageActivity"),
    canViewActivity: orgRoleHasPermission(role, "usageActivity"),
    canTransferOwnership: orgRoleHasPermission(role, "ownershipTransfer"),
    canAccessDanger: orgRoleHasPermission(role, "orgDelete"),
  }
}
