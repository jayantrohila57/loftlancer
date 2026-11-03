import {
  DEFAULT_TEAM_PROJECT_GRANTS,
  mergeProjectMemberGrants,
} from "@loftlancer/actions";
import { db, softDeleteSet } from "@loftlancer/db";
import { member } from "@loftlancer/db/schema/organization";
import {
  projectMemberGrant,
  projectTeam,
} from "@loftlancer/db/schema/project-access";
import { project } from "@loftlancer/db/schema/projects";
import { team, teamMember } from "@loftlancer/db/schema/team";
import { isSoftDeletesEnabled } from "@loftlancer/env/soft-deletes";
import { and, eq, inArray, isNull } from "drizzle-orm";
export async function applyDefaultGrantsForTeamOnProject(input: {
  organizationId: string;
  projectId: string;
  teamId: string;
  actorUserId: string;
}) {
  const teamMembers = await db
    .select({ userId: teamMember.userId })
    .from(teamMember)
    .where(eq(teamMember.teamId, input.teamId));

  if (!teamMembers.length) return;

  const orgMembers = await db
    .select({ userId: member.userId, role: member.role })
    .from(member)
    .where(
      and(
        eq(member.organizationId, input.organizationId),
        inArray(
          member.userId,
          teamMembers.map((row) => row.userId),
        ),
        isNull(member.deletedAt),
      ),
    );

  const memberUserIds = new Set(
    orgMembers.filter((row) => row.role === "member").map((row) => row.userId),
  );

  for (const userId of memberUserIds) {
    const [existing] = await db
      .select({ id: projectMemberGrant.id, grants: projectMemberGrant.grants })
      .from(projectMemberGrant)
      .where(
        and(
          eq(projectMemberGrant.projectId, input.projectId),
          eq(projectMemberGrant.userId, userId),
          isNull(projectMemberGrant.deletedAt),
        ),
      )
      .limit(1);

    const grants = mergeProjectMemberGrants(
      existing?.grants ?? [],
      DEFAULT_TEAM_PROJECT_GRANTS,
    );

    if (existing) {
      await db
        .update(projectMemberGrant)
        .set({
          grants,
          updatedBy: input.actorUserId,
          updatedAt: new Date(),
        })
        .where(eq(projectMemberGrant.id, existing.id));
    } else {
      await db.insert(projectMemberGrant).values({
        id: crypto.randomUUID(),
        organizationId: input.organizationId,
        projectId: input.projectId,
        userId,
        grants,
        updatedBy: input.actorUserId,
      });
    }
  }
}

export async function upsertProjectTeamLink(input: {
  organizationId: string;
  projectId: string;
  teamId: string;
  createdBy: string;
}) {
  const [projectRow] = await db
    .select({ id: project.id })
    .from(project)
    .where(
      and(
        eq(project.id, input.projectId),
        eq(project.organizationId, input.organizationId),
        isNull(project.deletedAt),
      ),
    )
    .limit(1);
  if (!projectRow) throw new Error("project_not_found");

  const [teamRow] = await db
    .select({ id: team.id })
    .from(team)
    .where(
      and(
        eq(team.id, input.teamId),
        eq(team.organizationId, input.organizationId),
        isNull(team.deletedAt),
      ),
    )
    .limit(1);
  if (!teamRow) throw new Error("team_not_found");

  const [existing] = await db
    .select({ id: projectTeam.id, deletedAt: projectTeam.deletedAt })
    .from(projectTeam)
    .where(
      and(
        eq(projectTeam.projectId, input.projectId),
        eq(projectTeam.teamId, input.teamId),
      ),
    )
    .limit(1);

  if (existing?.deletedAt === null) {
    return { ok: true, id: existing.id };
  }

  if (existing && isSoftDeletesEnabled()) {
    await db
      .update(projectTeam)
      .set({
        deletedAt: null,
        deletedBy: null,
        createdBy: input.createdBy,
      })
      .where(eq(projectTeam.id, existing.id));
  } else {
    const id = crypto.randomUUID();
    await db.insert(projectTeam).values({
      id,
      organizationId: input.organizationId,
      projectId: input.projectId,
      teamId: input.teamId,
      createdBy: input.createdBy,
    });
  }

  await applyDefaultGrantsForTeamOnProject({
    organizationId: input.organizationId,
    projectId: input.projectId,
    teamId: input.teamId,
    actorUserId: input.createdBy,
  });

  return { ok: true };
}

export async function softDeleteProjectTeamLink(input: {
  organizationId: string;
  projectId: string;
  teamId: string;
  actorUserId: string;
}) {
  if (!isSoftDeletesEnabled()) {
    await db
      .delete(projectTeam)
      .where(
        and(
          eq(projectTeam.projectId, input.projectId),
          eq(projectTeam.teamId, input.teamId),
          eq(projectTeam.organizationId, input.organizationId),
        ),
      );
    return { ok: true };
  }

  await db
    .update(projectTeam)
    .set(softDeleteSet(input.actorUserId))
    .where(
      and(
        eq(projectTeam.projectId, input.projectId),
        eq(projectTeam.teamId, input.teamId),
        eq(projectTeam.organizationId, input.organizationId),
        isNull(projectTeam.deletedAt),
      ),
    );
  return { ok: true };
}
