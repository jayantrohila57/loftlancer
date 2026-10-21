import { isOrgRoleAtLeast, normalizeOrgRole } from "./org-roles";
import { isPlatformAdminFlag } from "./platform-admin-flag";
import { getActionDefinition } from "./registry";
import type { ActionName, OrgRole, TeamRole } from "./types";

export type ProjectAccessContext = {
  isProjectCreator?: boolean;
  isProjectManager?: boolean;
  memberGrants?: string[];
  hasTeamLink?: boolean;
};

export type TeamAccessContext = {
  belongsToOrganization: boolean;
  role: TeamRole | null;
};

export type EvaluatePermissionInput = {
  action: ActionName;
  orgRole: OrgRole | null;
  project?: ProjectAccessContext | null;
  team?: TeamAccessContext | null;
};

export type EvaluatePermissionResult =
  | { allowed: true }
  | { allowed: false; reason: string };

export function isPlatformAdmin(): boolean {
  return isPlatformAdminFlag();
}

export function evaluatePermission(
  input: EvaluatePermissionInput,
): EvaluatePermissionResult {
  const def = getActionDefinition(input.action);

  if (def.scope === "platform") {
    return { allowed: false, reason: "platform_admin_required" };
  }

  if (def.scope === "user") {
    return { allowed: true };
  }

  const orgRole = input.orgRole;
  if (!orgRole) {
    return { allowed: false, reason: "no_org_role" };
  }

  if (orgRole === "owner") {
    return { allowed: true };
  }

  if (
    input.team?.belongsToOrganization &&
    input.team.role &&
    def.teamRoles?.includes(input.team.role)
  ) {
    return { allowed: true };
  }

  const orgRoles = def.orgRoles;
  if (orgRoles?.length && !orgRoles.includes(orgRole)) {
    return { allowed: false, reason: "org_role_denied" };
  }

  if (def.scope === "organization") {
    if (def.requiresProjectGrant && orgRole === "manager") {
      return { allowed: false, reason: "project_assignment_required" };
    }
    return { allowed: true };
  }

  if (def.scope === "project") {
    const project = input.project;
    if (orgRole === "manager") {
      if (!project?.isProjectManager && !project?.isProjectCreator) {
        return { allowed: false, reason: "not_project_manager" };
      }
      return { allowed: true };
    }

    if (orgRole === "member") {
      if (!project?.hasTeamLink) {
        return { allowed: false, reason: "no_team_on_project" };
      }
      const key = def.projectGrantKey ?? def.name;
      const grants = project.memberGrants ?? [];
      if (!grants.includes(key)) {
        return { allowed: false, reason: "grant_missing" };
      }
      return { allowed: true };
    }
  }

  return { allowed: false, reason: "denied" };
}

/** Single predicate for project.read (list scope and assertProjectAccess). */
export function canReadProject(
  orgRole: OrgRole | null,
  project?: ProjectAccessContext | null,
): boolean {
  return evaluatePermission({
    action: "project.read",
    orgRole,
    project,
  }).allowed;
}

/** Client/server helper: can this org role ever perform action without project context? */
export function canOrgRoleAttempt(
  action: ActionName,
  rawRole: string | null,
): boolean {
  const orgRole = normalizeOrgRole(rawRole);
  return (
    evaluatePermission({ action, orgRole, project: null }).allowed ||
    orgRole === "owner"
  );
}

export function orgRoleSatisfiesAction(
  action: ActionName,
  rawRole: string | null,
): boolean {
  const def = getActionDefinition(action);
  const orgRole = normalizeOrgRole(rawRole);
  if (!orgRole) return false;
  if (orgRole === "owner") return true;
  if (def.scope === "user") return true;
  const requiredRole = def.orgRoles?.[0];
  if (!requiredRole) return false;
  return isOrgRoleAtLeast(orgRole, requiredRole);
}

export type RoleCapability = "yes" | "grant" | "no";

/**
 * What a built-in org role can do for an action, using the same evaluator the
 * server enforces: "yes" without project context, "grant" only once assigned
 * to the project (manager) or granted via a team (member), "no" otherwise.
 */
export function roleCapability(
  action: ActionName,
  orgRole: OrgRole,
): RoleCapability {
  if (evaluatePermission({ action, orgRole, project: null }).allowed) {
    return "yes";
  }
  const def = getActionDefinition(action);
  const withAccess = evaluatePermission({
    action,
    orgRole,
    project: {
      isProjectManager: true,
      hasTeamLink: true,
      memberGrants: [def.projectGrantKey ?? def.name],
    },
  });
  return withAccess.allowed ? "grant" : "no";
}
