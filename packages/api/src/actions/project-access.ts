import { db } from "@loftlancer/db";
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
): Promise<{
  isProjectCreator: boolean;
  isProjectManager: boolean;
  memberGrants: string[];
  hasTeamLink: boolean;
}> {
  const [proj] = await db
    .select({ userId: project.userId })
    .from(project)
    .where(and(eq(project.id, projectId), isNull(project.deletedAt)))
    .limit(1);

  const [manager] = await db
    .select({ id: projectManager.id })
    .from(projectManager)
    .where(
      and(
        eq(projectManager.projectId, projectId),
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
        eq(projectMemberGrant.userId, userId),
        isNull(projectMemberGrant.deletedAt),
      ),
    )
    .limit(1);

  const teamLinks = await db
    .select({ teamId: projectTeam.teamId })
    .from(projectTeam)
    .where(
      and(eq(projectTeam.projectId, projectId), isNull(projectTeam.deletedAt)),
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
          isNull(team.deletedAt),
        ),
      )
      .limit(1);
    hasTeamLink = Boolean(membership);
  }

  return {
    isProjectCreator: proj?.userId === userId,
    isProjectManager: Boolean(manager),
    memberGrants: grantRow?.grants ?? [],
    hasTeamLink,
  };
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
