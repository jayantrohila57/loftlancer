import {
  type ActionName,
  actionNames,
  appIdForAction,
  canReadProject,
  evaluatePermission,
  formatActionLabel,
  getActionDefinition,
  getAppManifest,
  isActionsAuditEnabled,
  normalizeOrgRole,
} from "@loftlancer/actions";
import { db } from "@loftlancer/db";
import { actionBlock } from "@loftlancer/db/schema/action-block";
import { auditEvent } from "@loftlancer/db/schema/audit-event";
import { user } from "@loftlancer/db/schema/auth";
import {
  member,
  memberOrganizationRole,
  organizationRole,
  organizationRolePermission,
} from "@loftlancer/db/schema/organization";
import {
  projectManager,
  projectMemberGrant,
  projectTeam,
} from "@loftlancer/db/schema/project-access";
import { projectApp } from "@loftlancer/db/schema/project-app";
import { projectAppAccess } from "@loftlancer/db/schema/project-app-access";
import { project } from "@loftlancer/db/schema/projects";
import { team, teamMember } from "@loftlancer/db/schema/team";
import { and, desc, eq, gt, inArray, isNull, or } from "drizzle-orm";
import {
  isDelegableOrganizationAction,
  loadCustomOrganizationActions,
} from "../actions/custom-role-permissions";
import { requireAction } from "../actions/require-action";
import { isProjectAppAccessAllowed } from "../apps/project-app-access-policy";
import { getEffectiveProjectAccess } from "../project-access/effective-access";
import { filterBlockedMemberActions } from "./policy";

type ProjectRow = {
  id: string;
  name: string;
  slug: string;
  creatorUserId: string;
};

/** A bounded, tenant-scoped read model for the member detail panel. */
export async function loadMemberAccessSummary(input: {
  organizationId: string;
  memberId: string;
  viewerUserId: string;
}) {
  const [target] = await db
    .select({
      id: member.id,
      userId: member.userId,
      role: member.role,
      suspendedAt: member.suspendedAt,
      suspensionReason: member.suspensionReason,
      name: user.name,
      email: user.email,
    })
    .from(member)
    .innerJoin(user, eq(member.userId, user.id))
    .where(
      and(
        eq(member.id, input.memberId),
        eq(member.organizationId, input.organizationId),
        isNull(member.deletedAt),
      ),
    )
    .limit(1);
  if (!target) return null;

  const targetRole = normalizeOrgRole(target.role);
  const [orgRoleRows, teams, projects] = await Promise.all([
    db
      .select({
        name: organizationRole.name,
        actionName: organizationRolePermission.actionName,
      })
      .from(memberOrganizationRole)
      .innerJoin(
        organizationRole,
        and(
          eq(memberOrganizationRole.roleId, organizationRole.id),
          eq(
            memberOrganizationRole.organizationId,
            organizationRole.organizationId,
          ),
        ),
      )
      .leftJoin(
        organizationRolePermission,
        and(
          eq(organizationRolePermission.roleId, organizationRole.id),
          eq(organizationRolePermission.organizationId, input.organizationId),
        ),
      )
      .where(
        and(
          eq(memberOrganizationRole.memberId, target.id),
          eq(memberOrganizationRole.organizationId, input.organizationId),
        ),
      ),
    db
      .select({
        id: team.id,
        name: team.name,
        purpose: team.purpose,
        role: teamMember.role,
      })
      .from(teamMember)
      .innerJoin(team, eq(teamMember.teamId, team.id))
      .where(
        and(
          eq(teamMember.userId, target.userId),
          eq(team.organizationId, input.organizationId),
          isNull(team.deletedAt),
        ),
      )
      .orderBy(team.name),
    db
      .select({
        id: project.id,
        name: project.name,
        slug: project.slug,
        creatorUserId: project.userId,
      })
      .from(project)
      .where(
        and(
          eq(project.organizationId, input.organizationId),
          isNull(project.deletedAt),
        ),
      )
      .orderBy(project.name),
  ]);
  const customActions = orgRoleRows.flatMap((row) =>
    row.actionName && isDelegableOrganizationAction(row.actionName)
      ? [row.actionName]
      : [],
  );
  const customRoleName = orgRoleRows[0]?.name ?? null;
  const targetTeamIds = new Set(teams.map((row) => row.id));

  const projectIds = projects.map((row) => row.id);
  const [targetManagers, targetGrants, allTeamLinks, appRows] =
    projectIds.length
      ? await Promise.all([
          db
            .select({ projectId: projectManager.projectId })
            .from(projectManager)
            .where(
              and(
                eq(projectManager.organizationId, input.organizationId),
                eq(projectManager.userId, target.userId),
                isNull(projectManager.deletedAt),
                inArray(projectManager.projectId, projectIds),
              ),
            ),
          db
            .select({
              projectId: projectMemberGrant.projectId,
              grants: projectMemberGrant.grants,
            })
            .from(projectMemberGrant)
            .where(
              and(
                eq(projectMemberGrant.organizationId, input.organizationId),
                eq(projectMemberGrant.userId, target.userId),
                isNull(projectMemberGrant.deletedAt),
                inArray(projectMemberGrant.projectId, projectIds),
              ),
            ),
          db
            .select({
              projectId: projectTeam.projectId,
              teamId: team.id,
              teamName: team.name,
            })
            .from(projectTeam)
            .innerJoin(
              team,
              and(
                eq(projectTeam.teamId, team.id),
                eq(projectTeam.organizationId, team.organizationId),
              ),
            )
            .where(
              and(
                eq(projectTeam.organizationId, input.organizationId),
                isNull(projectTeam.deletedAt),
                isNull(team.deletedAt),
                inArray(projectTeam.projectId, projectIds),
              ),
            ),
          db
            .select({
              id: projectApp.id,
              projectId: projectApp.projectId,
              appId: projectApp.appId,
              accessMode: projectApp.accessMode,
            })
            .from(projectApp)
            .where(
              and(
                eq(projectApp.organizationId, input.organizationId),
                eq(projectApp.status, "active"),
                inArray(projectApp.projectId, projectIds),
              ),
            ),
        ])
      : [[], [], [], []];

  const viewerMembership = await db
    .select({ role: member.role })
    .from(member)
    .where(
      and(
        eq(member.organizationId, input.organizationId),
        eq(member.userId, input.viewerUserId),
        isNull(member.deletedAt),
        isNull(member.suspendedAt),
      ),
    )
    .limit(1);
  const viewerRole = normalizeOrgRole(viewerMembership[0]?.role);
  const [
    viewerManagers,
    viewerGrants,
    viewerTeamMemberships,
    viewerCustomActions,
  ] = await Promise.all([
    projectIds.length
      ? db
          .select({ projectId: projectManager.projectId })
          .from(projectManager)
          .where(
            and(
              eq(projectManager.organizationId, input.organizationId),
              eq(projectManager.userId, input.viewerUserId),
              isNull(projectManager.deletedAt),
              inArray(projectManager.projectId, projectIds),
            ),
          )
      : Promise.resolve([]),
    projectIds.length
      ? db
          .select({
            projectId: projectMemberGrant.projectId,
            grants: projectMemberGrant.grants,
          })
          .from(projectMemberGrant)
          .where(
            and(
              eq(projectMemberGrant.organizationId, input.organizationId),
              eq(projectMemberGrant.userId, input.viewerUserId),
              isNull(projectMemberGrant.deletedAt),
              inArray(projectMemberGrant.projectId, projectIds),
            ),
          )
      : Promise.resolve([]),
    db
      .select({ teamId: teamMember.teamId, role: teamMember.role })
      .from(teamMember)
      .innerJoin(team, eq(teamMember.teamId, team.id))
      .where(
        and(
          eq(teamMember.userId, input.viewerUserId),
          eq(team.organizationId, input.organizationId),
          isNull(team.deletedAt),
        ),
      ),
    loadCustomOrganizationActions(input.viewerUserId, input.organizationId),
  ]);
  const viewerTeamIds = new Set(viewerTeamMemberships.map((row) => row.teamId));
  const viewerTeamRoles = new Map(
    viewerTeamMemberships.map((row) => [row.teamId, row.role]),
  );
  let visibleTeams = teams.filter(
    (row) =>
      evaluatePermission({
        action: "team.member.list",
        orgRole: viewerRole,
        customOrganizationActions: viewerCustomActions,
        team: {
          belongsToOrganization: true,
          role: viewerTeamRoles.get(row.id) === "lead" ? "lead" : "member",
        },
      }).allowed,
  );
  const managerIds = new Set(targetManagers.map((row) => row.projectId));
  const grantByProject = new Map(
    targetGrants.map((row) => [row.projectId, row.grants]),
  );
  const viewerManagerIds = new Set(viewerManagers.map((row) => row.projectId));
  const viewerGrantByProject = new Map(
    viewerGrants.map((row) => [row.projectId, row.grants]),
  );

  let visibleProjects: ProjectRow[] = [];
  const targetProjectAccess = new Map<
    string,
    ReturnType<typeof getProjectAccess>
  >();
  const viewerProjectAccess = new Map<
    string,
    ReturnType<typeof getProjectAccess>
  >();
  for (const row of projects) {
    const links = allTeamLinks.filter((link) => link.projectId === row.id);
    const targetLinks = links.filter((link) => targetTeamIds.has(link.teamId));
    const targetAccess = getProjectAccess({
      role: targetRole,
      isProjectCreator: row.creatorUserId === target.userId,
      isProjectManager: managerIds.has(row.id),
      linkedTeams: targetLinks.map((link) => link.teamName),
      memberGrants: target.suspendedAt
        ? []
        : (grantByProject.get(row.id) ?? []),
    });
    targetProjectAccess.set(row.id, targetAccess);
    const viewerHasTeam = links.some((link) => viewerTeamIds.has(link.teamId));
    const viewerAccess = getProjectAccess({
      role: viewerRole,
      isProjectCreator: row.creatorUserId === input.viewerUserId,
      isProjectManager: viewerManagerIds.has(row.id),
      linkedTeams: links
        .filter((link) => viewerTeamIds.has(link.teamId))
        .map((link) => link.teamName),
      memberGrants: viewerGrantByProject.get(row.id) ?? [],
    });
    viewerProjectAccess.set(row.id, viewerAccess);
    if (
      canReadProject(viewerRole, {
        isProjectCreator: row.creatorUserId === input.viewerUserId,
        isProjectManager: viewerManagerIds.has(row.id),
        hasTeamLink: viewerHasTeam,
        memberGrants: viewerGrantByProject.get(row.id) ?? [],
      })
    ) {
      visibleProjects.push(row);
    }
  }

  const projectBlocks = projectIds.length
    ? await db
        .select({ scopeId: actionBlock.scopeId, action: actionBlock.action })
        .from(actionBlock)
        .where(
          and(
            eq(actionBlock.scopeType, "project"),
            inArray(actionBlock.scopeId, projectIds),
            or(
              isNull(actionBlock.expiresAt),
              gt(actionBlock.expiresAt, new Date()),
            ),
          ),
        )
    : [];
  const organizationBlocks = await db
    .select({ action: actionBlock.action })
    .from(actionBlock)
    .where(
      and(
        eq(actionBlock.scopeType, "organization"),
        eq(actionBlock.scopeId, input.organizationId),
        or(
          isNull(actionBlock.expiresAt),
          gt(actionBlock.expiresAt, new Date()),
        ),
      ),
    );
  const userBlocks = await db
    .select({ action: actionBlock.action })
    .from(actionBlock)
    .where(
      and(
        eq(actionBlock.scopeType, "user"),
        eq(actionBlock.scopeId, target.userId),
        or(
          isNull(actionBlock.expiresAt),
          gt(actionBlock.expiresAt, new Date()),
        ),
      ),
    );
  const viewerBlocks = await db
    .select({ action: actionBlock.action })
    .from(actionBlock)
    .where(
      and(
        eq(actionBlock.scopeType, "user"),
        eq(actionBlock.scopeId, input.viewerUserId),
        or(
          isNull(actionBlock.expiresAt),
          gt(actionBlock.expiresAt, new Date()),
        ),
      ),
    );
  const globallyBlocked = new Set([
    ...organizationBlocks.map((row) => row.action),
    ...userBlocks.map((row) => row.action),
  ]);
  const blockedByProject = new Map<string, Set<string>>();
  for (const row of projectBlocks) {
    if (!row.scopeId) continue;
    const blocked = blockedByProject.get(row.scopeId) ?? new Set<string>();
    blocked.add(row.action);
    blockedByProject.set(row.scopeId, blocked);
  }
  const viewerGloballyBlocked = new Set([
    ...organizationBlocks.map((row) => row.action),
    ...viewerBlocks.map((row) => row.action),
  ]);
  if (
    !filterBlockedMemberActions(["team.member.list"], viewerGloballyBlocked)
      .length
  ) {
    visibleTeams = [];
  }
  visibleProjects = visibleProjects.filter((row) => {
    const projectRead = viewerProjectAccess.get(row.id)?.effectiveActions ?? [];
    const blocked = blockedByProject.get(row.id) ?? new Set<string>();
    return filterBlockedMemberActions(
      projectRead,
      viewerGloballyBlocked,
      blocked,
    ).includes("project.read");
  });
  const orgActions = (actionNames as ActionName[]).filter((name) => {
    const allowed = evaluatePermission({
      action: name,
      orgRole: target.suspendedAt ? null : targetRole,
      customOrganizationActions: customActions,
    }).allowed;
    return (
      allowed &&
      getActionDefinition(name).scope === "organization" &&
      filterBlockedMemberActions([name], globallyBlocked).length > 0
    );
  });
  let activity:
    | {
        id: string;
        action: string;
        result: string;
        entityType: string;
        createdAt: Date;
      }[]
    | null = null;
  if (isActionsAuditEnabled()) {
    try {
      await requireAction("audit.timeline.view.user", {
        userId: input.viewerUserId,
        organizationId: input.organizationId,
        targetUserId: target.userId,
        audit: false,
      });
      activity = await db
        .select({
          id: auditEvent.id,
          action: auditEvent.action,
          result: auditEvent.result,
          entityType: auditEvent.entityType,
          createdAt: auditEvent.createdAt,
        })
        .from(auditEvent)
        .where(
          and(
            eq(auditEvent.organizationId, input.organizationId),
            eq(auditEvent.actorUserId, target.userId),
          ),
        )
        .orderBy(desc(auditEvent.createdAt))
        .limit(5);
    } catch {
      // Activity is optional; the member access summary remains available.
    }
  }

  const visibleIds = new Set(visibleProjects.map((row) => row.id));
  const apps = appRows.filter((app) => visibleIds.has(app.projectId));
  const appGrants = apps.length
    ? await db
        .select({
          projectAppId: projectAppAccess.projectAppId,
          userId: projectAppAccess.userId,
          teamId: projectAppAccess.teamId,
        })
        .from(projectAppAccess)
        .where(
          and(
            eq(projectAppAccess.organizationId, input.organizationId),
            isNull(projectAppAccess.deletedAt),
            inArray(
              projectAppAccess.projectAppId,
              apps.map((row) => row.id),
            ),
          ),
        )
    : [];
  const viewerAccessibleAppIds = new Set<string>();
  for (const app of apps) {
    const manifest = getAppManifest(app.appId);
    const readAction = manifest?.nav.find((item) => item.action)?.action;
    if (!readAction) continue;
    const viewerProject = projects.find((row) => row.id === app.projectId);
    const projectTeams = allTeamLinks.filter(
      (link) => link.projectId === app.projectId,
    );
    const viewerAccess = viewerProjectAccess.get(app.projectId);
    const projectBlocked =
      blockedByProject.get(app.projectId) ?? new Set<string>();
    if (
      !viewerAccess?.effectiveActions.includes(readAction) ||
      !filterBlockedMemberActions(
        [readAction],
        viewerGloballyBlocked,
        projectBlocked,
      ).length
    ) {
      continue;
    }
    const bypass =
      viewerRole === "owner" ||
      viewerRole === "manager" ||
      viewerProject?.creatorUserId === input.viewerUserId ||
      viewerManagerIds.has(app.projectId);
    const grants = appGrants.filter((grant) => grant.projectAppId === app.id);
    const hasDirect = grants.some(
      (grant) => grant.userId === input.viewerUserId,
    );
    const hasTeam = grants.some(
      (grant) =>
        grant.teamId &&
        viewerTeamIds.has(grant.teamId) &&
        projectTeams.some((link) => link.teamId === grant.teamId),
    );
    if (
      isProjectAppAccessAllowed({
        mode: app.accessMode === "restricted" ? "restricted" : "inherited",
        hasDirectGrant: hasDirect,
        hasLinkedTeamGrant: hasTeam,
        bypassRestriction: bypass,
      })
    ) {
      viewerAccessibleAppIds.add(app.id);
    }
  }
  const userVisibleApps = apps.filter((app) => {
    if (target.suspendedAt || !viewerAccessibleAppIds.has(app.id)) return false;
    const projectAccess = targetProjectAccess.get(app.projectId);
    const blocked = blockedByProject.get(app.projectId) ?? new Set<string>();
    const actions =
      projectAccess?.effectiveActions.filter(
        (name) =>
          appIdForAction(name) === app.appId &&
          filterBlockedMemberActions([name], globallyBlocked, blocked).length >
            0,
      ) ?? [];
    if (!actions.length) return false;
    const bypass =
      targetRole === "owner" ||
      targetRole === "manager" ||
      projects.find((row) => row.id === app.projectId)?.creatorUserId ===
        target.userId ||
      managerIds.has(app.projectId);
    const grants = appGrants.filter((grant) => grant.projectAppId === app.id);
    const hasDirect = grants.some((grant) => grant.userId === target.userId);
    const hasTeam = grants.some(
      (grant) =>
        grant.teamId &&
        targetTeamIds.has(grant.teamId) &&
        allTeamLinks.some(
          (link) =>
            link.projectId === app.projectId && link.teamId === grant.teamId,
        ),
    );
    return isProjectAppAccessAllowed({
      mode: app.accessMode === "restricted" ? "restricted" : "inherited",
      hasDirectGrant: hasDirect,
      hasLinkedTeamGrant: hasTeam,
      bypassRestriction: bypass,
    });
  });

  return {
    member: {
      userId: target.userId,
      name: target.name,
      email: target.email,
      role: targetRole,
      suspended: Boolean(target.suspendedAt),
      suspensionReason: target.suspensionReason,
      customRole: customRoleName,
      organizationActions: orgActions.map(formatActionLabel),
    },
    teams: target.suspendedAt
      ? []
      : visibleTeams.map((row) => ({
          id: row.id,
          name: row.name,
          purpose: row.purpose,
          role: row.role === "lead" ? "Team lead" : "Member",
        })),
    projects: visibleProjects.flatMap((row) => {
      const access = targetProjectAccess.get(row.id);
      const blocked = blockedByProject.get(row.id) ?? new Set<string>();
      const effectiveActions = target.suspendedAt
        ? []
        : filterBlockedMemberActions(
            access?.effectiveActions ?? [],
            globallyBlocked,
            blocked,
          );
      if (!effectiveActions.includes("project.read")) return [];
      return [
        {
          id: row.id,
          name: row.name,
          slug: row.slug,
          sources: access?.sources ?? [],
          permissions: effectiveActions.map(formatActionLabel),
        },
      ];
    }),
    apps: userVisibleApps.map((app) => ({
      id: app.appId,
      projectId: app.projectId,
      projectName:
        projects.find((row) => row.id === app.projectId)?.name ?? "Project",
      projectSlug: projects.find((row) => row.id === app.projectId)?.slug ?? "",
      name:
        app.appId === "tasks"
          ? "Tasks"
          : app.appId === "env"
            ? "Environments"
            : app.appId,
      sources:
        app.accessMode === "restricted"
          ? (() => {
              const grants = appGrants
                .filter(
                  (grant) =>
                    grant.projectAppId === app.id &&
                    (grant.userId === target.userId ||
                      (grant.teamId &&
                        targetTeamIds.has(grant.teamId) &&
                        allTeamLinks.some(
                          (link) =>
                            link.projectId === app.projectId &&
                            link.teamId === grant.teamId,
                        ))),
                )
                .map((grant) =>
                  grant.userId
                    ? "Direct app assignment"
                    : "Team app assignment",
                );
              if (grants.length) return grants;
              if (targetRole === "owner") return ["Organization owner"];
              if (targetRole === "manager") return ["Organization manager"];
              if (
                projects.find((row) => row.id === app.projectId)
                  ?.creatorUserId === target.userId
              )
                return ["Project creator"];
              if (managerIds.has(app.projectId)) return ["Project manager"];
              return [];
            })()
          : (targetProjectAccess.get(app.projectId)?.sources ?? []),
    })),
    activity,
  };
}

function getProjectAccess(input: {
  role: string | null;
  isProjectCreator: boolean;
  isProjectManager: boolean;
  linkedTeams: string[];
  memberGrants: string[];
}) {
  // Kept in one shared evaluator so access-source labels match Project Access.
  return getEffectiveProjectAccess(input);
}
