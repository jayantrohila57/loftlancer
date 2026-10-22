import { normalizeOrgRole } from "./org-roles";

export type OrganizationInviteRole = "owner" | "manager" | "member";

/** Prevent invite permissions from granting a built-in role above the actor. */
export function canAssignOrganizationInviteRole(
  actorRole: string | null | undefined,
  targetRole: OrganizationInviteRole,
): boolean {
  const role = normalizeOrgRole(actorRole);
  if (!role) return false;
  if (role === "owner") return true;
  if (targetRole === "owner") return false;
  if (role === "manager") return true;
  return targetRole === "member";
}
