import { db } from "@loftlancer/db";
import {
  projectManager,
  projectMemberGrant,
} from "@loftlancer/db/schema/project-access";
import { team, teamMember } from "@loftlancer/db/schema/team";
import { isSoftDeletesEnabled } from "@loftlancer/env/soft-deletes";
import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { countTeamMembershipsByTeam } from "./member-removal-policy";

/** Remove only access edges owned by the removed user in the removed org. */
export async function cleanupOrganizationMemberAccess(input: {
  organizationId: string;
  userId: string;
}) {
  const teamMembershipRows = await db
    .select({ id: teamMember.id, teamId: teamMember.teamId })
    .from(teamMember)
    .innerJoin(team, eq(teamMember.teamId, team.id))
    .where(
      and(
        eq(team.organizationId, input.organizationId),
        eq(teamMember.userId, input.userId),
      ),
    );
  const teamMembershipCounts = countTeamMembershipsByTeam(teamMembershipRows);
  const softDeletes = isSoftDeletesEnabled();
  const deletedAt = new Date();

  await db.transaction(async (tx) => {
    if (teamMembershipRows.length > 0) {
      await tx.delete(teamMember).where(
        inArray(
          teamMember.id,
          teamMembershipRows.map((row) => row.id),
        ),
      );

      for (const [teamId, count] of teamMembershipCounts) {
        await tx
          .update(team)
          .set({
            memberCount: sql`GREATEST(${team.memberCount} - ${count}, 0)`,
          })
          .where(
            and(
              eq(team.id, teamId),
              eq(team.organizationId, input.organizationId),
            ),
          );
      }
    }

    const projectAccessScope = and(
      eq(projectManager.organizationId, input.organizationId),
      eq(projectManager.userId, input.userId),
      isNull(projectManager.deletedAt),
    );
    const projectGrantScope = and(
      eq(projectMemberGrant.organizationId, input.organizationId),
      eq(projectMemberGrant.userId, input.userId),
      isNull(projectMemberGrant.deletedAt),
    );

    if (softDeletes) {
      await tx
        .update(projectManager)
        .set({ deletedAt, deletedBy: null })
        .where(projectAccessScope);
      await tx
        .update(projectMemberGrant)
        .set({ deletedAt, deletedBy: null })
        .where(projectGrantScope);
    } else {
      await tx.delete(projectManager).where(projectAccessScope);
      await tx.delete(projectMemberGrant).where(projectGrantScope);
    }
  });
}
