import type { OrgRole, StoredMemberRole } from "./types";

/** Normalize scalar or comma-separated DB roles (legacy `admin` → manager). */
export function normalizeOrgRole(
  role: string | null | undefined,
): OrgRole | null {
  if (!role) return null;
  const roles = role.split(",").map((item) => item.trim());
  if (roles.includes("owner")) return "owner";
  if (roles.includes("manager") || roles.includes("admin")) return "manager";
  if (roles.includes("member")) return "member";
  return "member";
}

export function isOrgRoleAtLeast(
  role: OrgRole | null,
  minimum: OrgRole,
): boolean {
  if (!role) return false;
  const rank: Record<OrgRole, number> = {
    owner: 3,
    manager: 2,
    member: 1,
  };
  return rank[role] >= rank[minimum];
}

export function storedRoleToOrgRole(role: StoredMemberRole): OrgRole {
  return normalizeOrgRole(role) ?? "member";
}
