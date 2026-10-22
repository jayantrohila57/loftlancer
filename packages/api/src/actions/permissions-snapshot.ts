import {
  type ActionName,
  actionNames,
  appIdForAction,
  evaluatePermission,
  getActionDefinition,
  normalizeOrgRole,
} from "@loftlancer/actions";
import { activeMemberWhere, db } from "@loftlancer/db";
import { member, organization } from "@loftlancer/db/schema/organization";
import { and, eq, isNull } from "drizzle-orm";
import { hasProjectAppAccess } from "../apps/project-app-access";
import { loadCustomOrganizationActions } from "./custom-role-permissions";
import {
  isActionBlockedInSet,
  loadBlockedActionsForScope,
} from "./is-action-blocked";
import {
  loadProjectAccessContext,
  userHasAnyProjectManagerAssignment,
} from "./project-access";
import { loadTeamAccessContext } from "./team-access";

export type PermissionsSnapshot = {
  platformAdmin: false;
  orgRole: "owner" | "manager" | "member" | null;
  /** Org member with no manager assignment and no team/project grants. */
  unassignedMember: boolean;
  actions: Record<string, boolean>;
  blocked: ActionName[];
};

export async function buildPermissionsSnapshot(input: {
  userId: string;
  organizationId: string | null;
  projectId?: string | null;
  teamId?: string | null;
}): Promise<PermissionsSnapshot> {
  const blocked: ActionName[] = [];
  const actions: Record<string, boolean> = {};

  let orgRole: "owner" | "manager" | "member" | null = null;
  if (input.organizationId) {
    const [membership] = await db
      .select({ role: member.role })
      .from(member)
      .innerJoin(organization, eq(member.organizationId, organization.id))
      .where(
        activeMemberWhere(
          and(
            eq(member.organizationId, input.organizationId),
            eq(member.userId, input.userId),
            isNull(organization.deletedAt),
          ),
        ),
      )
      .limit(1);
    orgRole = normalizeOrgRole(membership?.role);
  }

  const projectCtx = input.projectId
    ? await loadProjectAccessContext(
        input.userId,
        input.projectId,
        input.organizationId,
      )
    : null;
  const customOrganizationActions =
    orgRole === "member" && input.organizationId
      ? await loadCustomOrganizationActions(input.userId, input.organizationId)
      : [];
  const teamCtx =
    input.teamId && input.organizationId
      ? await loadTeamAccessContext(
          input.userId,
          input.teamId,
          input.organizationId,
        )
      : null;

  let managerHasTimeline = false;
  let unassignedMember = false;
  if (orgRole === "manager" && input.organizationId) {
    managerHasTimeline = await userHasAnyProjectManagerAssignment(
      input.userId,
      input.organizationId,
    );
  }
  if (orgRole === "member" && input.organizationId) {
    const accessible = await import("../project-list").then((m) =>
      m.listAccessibleProjectIds(input.userId, input.organizationId),
    );
    unassignedMember = (accessible?.length ?? 0) === 0;
  }

  const blockedActions = await loadBlockedActionsForScope({
    userId: input.userId,
    organizationId: input.organizationId,
    projectId: input.projectId,
  });

  const appAccess = new Map<string, boolean>();
  if (input.projectId && input.organizationId) {
    for (const name of actionNames) {
      const appId = appIdForAction(name);
      if (!appId || appAccess.has(appId)) continue;
      appAccess.set(
        appId,
        await hasProjectAppAccess({
          userId: input.userId,
          organizationId: input.organizationId,
          projectId: input.projectId,
          appId,
          bypassRestriction:
            orgRole === "owner" ||
            orgRole === "manager" ||
            projectCtx?.isProjectCreator === true ||
            projectCtx?.isProjectManager === true,
        }),
      );
    }
  }

  for (const name of actionNames) {
    const action = name as ActionName;
    const appId = appIdForAction(action);
    if (appId && input.projectId && !appAccess.get(appId)) {
      actions[name] = false;
      continue;
    }
    if (isActionBlockedInSet(action, blockedActions)) {
      blocked.push(action);
      actions[name] = false;
      continue;
    }

    if (
      input.projectId &&
      getActionDefinition(action).scope === "project" &&
      !projectCtx?.belongsToOrganization
    ) {
      actions[name] = false;
      continue;
    }
    if (
      input.teamId &&
      getActionDefinition(action).teamRoles?.length &&
      !teamCtx?.belongsToOrganization
    ) {
      actions[name] = false;
      continue;
    }

    const defScope = evaluatePermission({
      action,
      orgRole,
      customOrganizationActions,
      project: projectCtx,
      team: teamCtx,
    });

    if (
      action === "audit.timeline.view.org" &&
      orgRole === "manager" &&
      !managerHasTimeline
    ) {
      actions[name] = false;
      continue;
    }

    actions[name] = defScope.allowed;
  }

  return {
    platformAdmin: false,
    orgRole,
    unassignedMember,
    actions,
    blocked,
  };
}
