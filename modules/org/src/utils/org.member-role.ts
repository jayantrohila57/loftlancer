import {
  canEditOrganizationSettings,
  canManageElevatedOrganizationMembers,
  canManageOrganizationBilling,
  canManageOrganizationMembers,
  canViewOrganizationBilling,
  isOrganizationAdminRole,
  isOrganizationOwnerRole,
  ORG_PLUGIN_MANAGER_ROLE,
  parseOrganizationRoleList,
  resolveOrgProductRole,
} from "../shared/org.organization-access-control"

export {
  canEditOrganizationSettings,
  canManageElevatedOrganizationMembers,
  canManageOrganizationBilling,
  canManageOrganizationMembers,
  canViewOrganizationBilling,
  isOrganizationAdminRole,
  isOrganizationOwnerRole,
  parseOrganizationRoleList,
  resolveOrgProductRole,
}

export type OrgProductMemberRole = "owner" | "admin" | "manager" | "member"

/** @deprecated Use {@link ORG_PLUGIN_MANAGER_ROLE}. */
export const ORG_MANAGER_PLUGIN_ROLE = ORG_PLUGIN_MANAGER_ROLE

export function toProductMemberRole(pluginRole: string): OrgProductMemberRole {
  return resolveOrgProductRole(pluginRole)
}

export function toPluginMemberRole(
  productRole: Exclude<OrgProductMemberRole, "owner">
): string {
  return productRole
}

export const ORG_ASSIGNABLE_PRODUCT_MEMBER_ROLES = [
  "member",
  "manager",
  "admin",
] as const satisfies readonly Exclude<OrgProductMemberRole, "owner">[]
