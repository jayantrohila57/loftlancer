import { activeMemberWhere, db } from "@loftlancer/db";
import { member } from "@loftlancer/db/schema/organization";
import { team, teamMember } from "@loftlancer/db/schema/team";
import type { RunActionContext } from "@module/shared/server/run-action";
import { and, eq, isNull, sql } from "drizzle-orm";
import type { z } from "zod";
import type { teamMemberRoleInputSchema } from "../../utils/validation/utils.team-operations.validation";
import { teamOutcome } from "./server.team-outcome.service";

async function perform(
  userId: string,
  organizationId: string,
  teamId: string,
  targetUserId: string,
  role: "lead" | "member",
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
    const [targetMember] = await tx
      .select({ id: member.id })
      .from(member)
      .where(
        activeMemberWhere(
          and(
            eq(member.organizationId, organizationId),
            eq(member.userId, targetUserId),
          ),
        ),
      )
      .limit(1);
    if (!targetMember) throw new Error("organization_member_not_found");
    const [row] = await tx
      .select({ membershipId: teamMember.id, role: teamMember.role })
      .from(teamMember)
      .where(
        and(eq(teamMember.teamId, teamId), eq(teamMember.userId, targetUserId)),
      )
      .limit(1);
    if (!row) throw new Error("team_member_not_found");
    if (row.role === "lead" && role === "member") {
      const [leadCount] = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(teamMember)
        .where(and(eq(teamMember.teamId, teamId), eq(teamMember.role, "lead")));
      if ((leadCount?.count ?? 0) <= 1) {
        throw new Error("team_requires_lead");
      }
    }
    await tx
      .update(teamMember)
      .set({ role, updatedAt: new Date(), updatedBy: userId })
      .where(eq(teamMember.id, row.membershipId));
  });
  return { teamId, userId: targetUserId, role };
}

export function teamMemberRoleChangeService(
  ctx: RunActionContext,
  input: z.infer<typeof teamMemberRoleInputSchema>,
) {
  if (!ctx.orgId)
    return Promise.resolve({
      kind: "failed" as const,
      message: "Select an organization to continue.",
    });
  const organizationId = ctx.orgId;
  return teamOutcome(
    () =>
      perform(
        ctx.userId,
        organizationId,
        input.teamId,
        input.userId,
        input.role,
      ),
    "Team role updated",
  );
}
