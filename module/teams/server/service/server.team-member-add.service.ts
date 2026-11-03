import { activeMemberWhere, db } from "@loftlancer/drizzle";
import { member } from "@loftlancer/drizzle/schema/organization";
import { team, teamMember } from "@loftlancer/drizzle/schema/team";
import type { RunActionContext } from "@module/shared/server/run-action";
import { and, eq, isNull, sql } from "drizzle-orm";
import type { z } from "zod";
import type { teamMemberInputSchema } from "../../utils/validation/utils.team-operations.validation";
import { teamOutcome } from "./server.team-outcome.service";
import { applyTeamProjectDefaults } from "./server.team-project-defaults.service";

async function perform(
  userId: string,
  organizationId: string,
  teamId: string,
  targetUserId: string,
) {
  await db.transaction(async (tx) => {
    const [activeMember] = await tx
      .select({ id: member.id, role: member.role })
      .from(member)
      .where(
        activeMemberWhere(
          and(
            eq(member.organizationId, organizationId),
            eq(member.userId, targetUserId),
          ),
        ),
      )
      .limit(1)
      .for("update");
    if (!activeMember) throw new Error("organization_member_not_found");
    const [teamRow] = await tx
      .select({ id: team.id })
      .from(team)
      .where(
        and(
          eq(team.id, teamId),
          eq(team.organizationId, organizationId),
          isNull(team.deletedAt),
        ),
      )
      .for("update");
    if (!teamRow) throw new Error("team_not_found");
    const [existing] = await tx
      .select({ id: teamMember.id })
      .from(teamMember)
      .where(
        and(eq(teamMember.teamId, teamId), eq(teamMember.userId, targetUserId)),
      )
      .limit(1);
    if (!existing) {
      await tx.insert(teamMember).values({
        id: crypto.randomUUID(),
        teamId,
        userId: targetUserId,
        addedBy: userId,
        updatedAt: new Date(),
        updatedBy: userId,
      });
    }
    await applyTeamProjectDefaults(tx, {
      organizationId,
      teamId,
      userId: targetUserId,
      actorUserId: userId,
      role: activeMember.role,
    });
    const [count] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(teamMember)
      .where(eq(teamMember.teamId, teamId));
    await tx
      .update(team)
      .set({ memberCount: count?.count ?? 0 })
      .where(eq(team.id, teamId));
  });
  return { teamId, userId: targetUserId };
}

export function teamMemberAddService(
  ctx: RunActionContext,
  input: z.infer<typeof teamMemberInputSchema>,
) {
  if (!ctx.orgId)
    return Promise.resolve({
      kind: "failed" as const,
      message: "Select an organization to continue.",
    });
  const organizationId = ctx.orgId;
  return teamOutcome(
    () => perform(ctx.userId, organizationId, input.teamId, input.userId),
    "Member added to team",
  );
}
