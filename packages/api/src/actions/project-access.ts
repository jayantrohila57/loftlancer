import { db } from "@loftlancer/db";
import { organization } from "@loftlancer/db/schema/organization";
import {
  projectManager,
  projectMemberGrant,
  projectTeam,
} from "@loftlancer/db/schema/project-access";
import { project } from "@loftlancer/db/schema/projects";
import { team, teamMember } from "@loftlancer/db/schema/team";
import { and, eq, inArray, isNull } from "drizzle-orm";

export async function loadProjectAccessContext(
  userId: string,
  projectId: string,
  organizationId?: string | null,
  options: { includeDeleted?: boolean } = {},
): Promise<{
  isProjectCreator: boolean;
  isProjectManager: boolean;
  memberGrants: string[];
  hasTeamLink: boolean;
  belongsToOrganization: boolean;
}> {
  const [proj] = await db
    .select({
      userId: project.userId,
      organizationId: project.organizationId,
    })
    .from(project)
    .innerJoin(organization, eq(project.organizationId, organization.id))
    .where(
      and(
        eq(project.id, projectId),
        ...(options.includeDeleted ? [] : [isNull(project.deletedAt)]),
        isNull(organization.deletedAt),
      ),
    )
    .limit(1);
  const belongsToOrganization = Boolean(
    proj && projectBelongsToOrganization(proj.organizationId, organizationId),
  );

  if (!proj?.organizationId || !belongsToOrganization) {
    return {
      isProjectCreator: false,
      isProjectManager: false,
      memberGrants: [],
      hasTeamLink: false,
      belongsToOrganization: false,
    };
  }
  const projectOrganizationId = proj.organizationId;

  const [manager] = await db
    .select({ id: projectManager.id })
    .from(projectManager)
    .where(
      and(
        eq(projectManager.projectId, projectId),
        eq(projectManager.organizationId, projectOrganizationId),
        eq(projectManager.userId, userId),
        isNull(projectManager.deletedAt),
      ),
    )
    .limit(1);

  const [grantRow] = await db
    .select({ grants: projectMemberGrant.grants })
    .from(projectMemberGrant)
    .where(
      and(
        eq(projectMemberGrant.projectId, projectId),
        eq(projectMemberGrant.organizationId, projectOrganizationId),
        eq(projectMemberGrant.userId, userId),
        isNull(projectMemberGrant.deletedAt),
      ),
    )
    .limit(1);

  const teamLinks = await db
    .select({ teamId: projectTeam.teamId })
    .from(projectTeam)
    .where(
      and(
        eq(projectTeam.projectId, projectId),
        eq(projectTeam.organizationId, projectOrganizationId),
        isNull(projectTeam.deletedAt),
      ),
    );

  let hasTeamLink = false;
  if (teamLinks.length) {
    const teamIds = teamLinks.map((t) => t.teamId);
    const [membership] = await db
      .select({ id: teamMember.id })
      .from(teamMember)
      .innerJoin(team, eq(teamMember.teamId, team.id))
      .where(
        and(
          eq(teamMember.userId, userId),
          inArray(teamMember.teamId, teamIds),
          eq(team.organizationId, projectOrganizationId),
          isNull(team.deletedAt),
        ),
      )
      .limit(1);
    hasTeamLink = Boolean(membership);
  }

  return {
    isProjectCreator: proj.userId === userId,
    isProjectManager: Boolean(manager),
    memberGrants: grantRow?.grants ?? [],
    hasTeamLink,
    belongsToOrganization,
  };
}

function projectBelongsToOrganization(
  projectOrganizationId: string | null,
  activeOrganizationId?: string | null,
) {
  return Boolean(
    projectOrganizationId &&
      (!activeOrganizationId || projectOrganizationId === activeOrganizationId),
  );
}

export async function userHasAnyProjectManagerAssignment(
  userId: string,
  organizationId: string,
): Promise<boolean> {
  const [row] = await db
    .select({ id: projectManager.id })
    .from(projectManager)
    .where(
      and(
        eq(projectManager.userId, userId),
        eq(projectManager.organizationId, organizationId),
        isNull(projectManager.deletedAt),
      ),
    )
    .limit(1);
  return Boolean(row);
}
