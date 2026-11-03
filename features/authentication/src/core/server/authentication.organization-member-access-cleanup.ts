import { db } from "@loftlancer/drizzle";
import {
  projectManager,
  projectMemberGrant,
} from "@loftlancer/drizzle/schema/project-access";
import { team, teamMember } from "@loftlancer/drizzle/schema/team";
import { isSoftDeletesEnabled } from "@loftlancer/t3-env/soft-deletes";
import { and, eq, inArray, isNull, sql } from "drizzle-orm";

function countTeamMembershipsByTeam(
  rows: Array<{ id: string; teamId: string }>,
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const row of rows) {
    counts.set(row.teamId, (counts.get(row.teamId) ?? 0) + 1);
  }
  return counts;
}

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
