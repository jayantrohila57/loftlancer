import {
  DEFAULT_TEAM_PROJECT_GRANTS,
  mergeProjectMemberGrants,
} from "@loftlancer/actions";
import type { db } from "@loftlancer/db";
import {
  projectMemberGrant,
  projectTeam,
} from "@loftlancer/db/schema/project-access";
import { and, eq, isNull } from "drizzle-orm";

type OrganizationMutationTx = Parameters<
  Parameters<typeof db.transaction>[0]
>[0];

export async function applyTeamProjectDefaults(
  tx: OrganizationMutationTx,
  input: {
    organizationId: string;
    teamId: string;
    userId: string;
    actorUserId: string;
    role: string;
  },
) {
  if (input.role !== "member") return;

  const linkedProjects = await tx
    .select({ projectId: projectTeam.projectId })
    .from(projectTeam)
    .where(
      and(
        eq(projectTeam.organizationId, input.organizationId),
        eq(projectTeam.teamId, input.teamId),
        isNull(projectTeam.deletedAt),
      ),
    )
    .orderBy(projectTeam.projectId);

  for (const { projectId } of linkedProjects) {
    const [existing] = await tx
      .select({
        id: projectMemberGrant.id,
        grants: projectMemberGrant.grants,
      })
      .from(projectMemberGrant)
      .where(
        and(
          eq(projectMemberGrant.organizationId, input.organizationId),
          eq(projectMemberGrant.projectId, projectId),
          eq(projectMemberGrant.userId, input.userId),
          isNull(projectMemberGrant.deletedAt),
        ),
      )
      .limit(1)
      .for("update");
    const grants = mergeProjectMemberGrants(
      existing?.grants ?? [],
      DEFAULT_TEAM_PROJECT_GRANTS,
    );

    if (existing) {
      await tx
        .update(projectMemberGrant)
        .set({
          grants,
          updatedBy: input.actorUserId,
          updatedAt: new Date(),
        })
        .where(eq(projectMemberGrant.id, existing.id));
    } else {
      await tx.insert(projectMemberGrant).values({
        id: crypto.randomUUID(),
        organizationId: input.organizationId,
        projectId,
        userId: input.userId,
        grants,
        updatedBy: input.actorUserId,
      });
    }
  }
}
