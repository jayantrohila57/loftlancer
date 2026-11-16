import {
  defaultAc,
  defaultRoles,
} from "better-auth/plugins/organization/access"

/** Better Auth organization plugin access control (server + client must share). */
export const orgOrganizationAccessControl = defaultAc

const orgAdminAc = defaultAc.newRole({
  organization: ["update"],
  invitation: ["create", "cancel"],
  member: ["create", "update", "delete"],
  team: ["create", "update", "delete"],
  ac: ["create", "read", "update", "delete"],
})

const orgManagerAc = defaultAc.newRole({
  organization: [],
  invitation: ["create", "cancel"],
  member: ["create", "update", "delete"],
  team: [],
  ac: ["read"],
})

export const orgOrganizationPluginRoles = {
  owner: defaultRoles.owner,
  admin: orgAdminAc,
  manager: orgManagerAc,
  member: defaultRoles.member,
}

export const ORG_PLUGIN_ADMIN_ROLE = "admin"
export const ORG_PLUGIN_MANAGER_ROLE = "manager"

export const ORG_PRODUCT_ROLE_IDS = [
  "owner",
  "admin",
  "manager",
  "member",
] as const

export type OrgProductRoleId = (typeof ORG_PRODUCT_ROLE_IDS)[number]

export type OrgProductPermissionId =
  | "orgHome"
  | "usageActivity"
  | "orgSettingsView"
  | "orgSettingsEdit"
  | "membersManage"
  | "membersManageElevated"
  | "invitationsManage"
  | "rolesView"
  | "rolesManage"
  | "billingView"
  | "billingManage"
  | "ownershipTransfer"
  | "orgDelete"

export const ORG_PRODUCT_PERMISSION_ROWS: ReadonlyArray<{
  readonly id: OrgProductPermissionId
  readonly labelKey: `organizationPermission${string}`
}> = [
  { id: "orgHome", labelKey: "organizationPermissionOrgHome" },
  { id: "usageActivity", labelKey: "organizationPermissionUsageActivity" },
  { id: "orgSettingsView", labelKey: "organizationPermissionOrgSettingsView" },
  { id: "orgSettingsEdit", labelKey: "organizationPermissionOrgSettingsEdit" },
  {
    id: "membersManage",
    labelKey: "organizationPermissionMembersManage",
  },
  {
    id: "membersManageElevated",
    labelKey: "organizationPermissionMembersManageElevated",
  },
  {
    id: "invitationsManage",
    labelKey: "organizationPermissionInvitationsManage",
  },
  { id: "rolesView", labelKey: "organizationPermissionRolesView" },
  { id: "rolesManage", labelKey: "organizationPermissionRolesManage" },
  { id: "billingView", labelKey: "organizationPermissionBillingView" },
  { id: "billingManage", labelKey: "organizationPermissionBillingManage" },
  {
    id: "ownershipTransfer",
    labelKey: "organizationPermissionOwnershipTransfer",
  },
  { id: "orgDelete", labelKey: "organizationPermissionOrgDelete" },
]

const ORG_ROLE_PERMISSION_MATRIX: Record<
  OrgProductRoleId,
  Record<OrgProductPermissionId, boolean>
> = {
  owner: {
    orgHome: true,
    usageActivity: true,
    orgSettingsView: true,
    orgSettingsEdit: true,
    membersManage: true,
    membersManageElevated: true,
    invitationsManage: true,
    rolesView: true,
    rolesManage: true,
    billingView: true,
    billingManage: true,
    ownershipTransfer: true,
    orgDelete: true,
  },
  admin: {
    orgHome: true,
    usageActivity: true,
    orgSettingsView: true,
    orgSettingsEdit: true,
    membersManage: true,
    membersManageElevated: true,
    invitationsManage: true,
    rolesView: true,
    rolesManage: true,
    billingView: true,
    billingManage: true,
    ownershipTransfer: false,
    orgDelete: false,
  },
  manager: {
    orgHome: true,
    usageActivity: true,
    orgSettingsView: true,
    orgSettingsEdit: false,
    membersManage: true,
    membersManageElevated: false,
    invitationsManage: true,
    rolesView: true,
    rolesManage: false,
    billingView: true,
    billingManage: false,
    ownershipTransfer: false,
    orgDelete: false,
  },
  member: {
    orgHome: true,
    usageActivity: true,
    orgSettingsView: false,
    orgSettingsEdit: false,
    membersManage: false,
    membersManageElevated: false,
    invitationsManage: false,
    rolesView: true,
    rolesManage: false,
    billingView: false,
    billingManage: false,
    ownershipTransfer: false,
    orgDelete: false,
  },
}

export function orgProductRolePermissionMatrix() {
  return ORG_ROLE_PERMISSION_MATRIX
}

export function parseOrganizationRoleList(role: string): string[] {
  return role
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean)
}

export function resolveOrgProductRole(
  pluginRole: string | null | undefined
): OrgProductRoleId {
  if (!pluginRole) return "member"
  const roles = parseOrganizationRoleList(pluginRole)
  if (roles.includes("owner")) return "owner"
  if (roles.includes(ORG_PLUGIN_ADMIN_ROLE)) return "admin"
  if (roles.includes(ORG_PLUGIN_MANAGER_ROLE)) return "manager"
  return "member"
}

export function orgRoleHasPermission(
  pluginRole: string | null | undefined,
  permission: OrgProductPermissionId
): boolean {
  const productRole = resolveOrgProductRole(pluginRole)
  return ORG_ROLE_PERMISSION_MATRIX[productRole][permission]
}

export function isOrganizationOwnerRole(role: string): boolean {
  return parseOrganizationRoleList(role).includes("owner")
}

export function isOrganizationAdminRole(role: string): boolean {
  return parseOrganizationRoleList(role).includes(ORG_PLUGIN_ADMIN_ROLE)
}

export function isOrganizationPrivilegedMemberRole(role: string): boolean {
  const roles = parseOrganizationRoleList(role)
  return (
    roles.includes("owner") ||
    roles.includes(ORG_PLUGIN_ADMIN_ROLE) ||
    roles.includes(ORG_PLUGIN_MANAGER_ROLE)
  )
}

export function canViewOrganizationBilling(
  role: string | null | undefined
): boolean {
  return orgRoleHasPermission(role, "billingView")
}

export function canManageOrganizationBilling(
  role: string | null | undefined
): boolean {
  return orgRoleHasPermission(role, "billingManage")
}

export function canManageOrganizationMembers(
  role: string | null | undefined
): boolean {
  return orgRoleHasPermission(role, "membersManage")
}

export function canManageElevatedOrganizationMembers(
  role: string | null | undefined
): boolean {
  return orgRoleHasPermission(role, "membersManageElevated")
}

export function canEditOrganizationSettings(
  role: string | null | undefined
): boolean {
  return orgRoleHasPermission(role, "orgSettingsEdit")
}
