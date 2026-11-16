import { ORG_OWNER_MEMBER_ROLE } from "./constants/org.constants.entitlements"

/** Better Auth organization plugin role id for managers (v1 product label). */
export const ORG_MANAGER_PLUGIN_ROLE = "manager"

export type OrgProductMemberRole = "member" | "manager" | "owner"

export function parseOrganizationRoleList(role: string): string[] {
  return role
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean)
}

export function isOrganizationOwnerRole(role: string): boolean {
  return parseOrganizationRoleList(role).includes(ORG_OWNER_MEMBER_ROLE)
}

export function toProductMemberRole(pluginRole: string): OrgProductMemberRole {
  const roles = parseOrganizationRoleList(pluginRole)
  if (roles.includes(ORG_OWNER_MEMBER_ROLE)) return "owner"
  if (roles.includes(ORG_MANAGER_PLUGIN_ROLE) || roles.includes("admin")) {
    return "manager"
  }
  return "member"
}

export function toPluginMemberRole(
  productRole: Exclude<OrgProductMemberRole, "owner">
): string {
  return productRole
}

export const ORG_ASSIGNABLE_PRODUCT_MEMBER_ROLES = [
  "member",
  "manager",
] as const satisfies readonly Exclude<OrgProductMemberRole, "owner">[]

/** Owner, plugin admin, or product manager may manage billing. */
export function canManageOrganizationBilling(role: string): boolean {
  const roles = parseOrganizationRoleList(role)
  return (
    roles.includes(ORG_OWNER_MEMBER_ROLE) ||
    roles.includes("admin") ||
    roles.includes(ORG_MANAGER_PLUGIN_ROLE)
  )
}
