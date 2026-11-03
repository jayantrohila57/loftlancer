import { db } from "@loftlancer/drizzle";
import { team, teamMember } from "@loftlancer/drizzle/schema/team";
import type { RunActionContext } from "@module/shared/server/run-action";
import { and, eq, isNull, sql } from "drizzle-orm";
import type { z } from "zod";
import type { teamMemberInputSchema } from "../../utils/validation/utils.team-operations.validation";
import { teamOutcome } from "./server.team-outcome.service";

async function perform(
  _userId: string,
  organizationId: string,
  teamId: string,
  targetUserId: string,
) {
  await db.transaction(async (tx) => {
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
    const [target] = await tx
      .select({ role: teamMember.role })
      .from(teamMember)
      .where(
        and(eq(teamMember.teamId, teamId), eq(teamMember.userId, targetUserId)),
      )
      .limit(1);
    if (target?.role === "lead") {
      const [leadCount] = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(teamMember)
        .where(and(eq(teamMember.teamId, teamId), eq(teamMember.role, "lead")));
      if ((leadCount?.count ?? 0) <= 1) {
        throw new Error("team_requires_lead");
      }
    }
    await tx
      .delete(teamMember)
      .where(
        and(eq(teamMember.teamId, teamId), eq(teamMember.userId, targetUserId)),
      );
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

export function teamMemberRemoveService(
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
    "Member removed from team",
  );
}
