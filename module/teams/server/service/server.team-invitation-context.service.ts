import { activeMemberWhere, db } from "@loftlancer/db";
import { user } from "@loftlancer/db/schema/auth";
import { invitation, member } from "@loftlancer/db/schema/organization";
import { team } from "@loftlancer/db/schema/team";
import type { RunActionContext } from "@module/shared/server/run-action";
import { and, eq, gt, isNull } from "drizzle-orm";
import { teamOutcome } from "./server.team-outcome.service";
export function teamInvitationContextService(
  ctx: RunActionContext,
  input: { teamId: string },
) {
  return teamOutcome(async () => {
    const [found] = await db
      .select({ id: team.id })
      .from(team)
      .where(
        and(
          eq(team.id, input.teamId),
          eq(team.organizationId, ctx.orgId ?? ""),
          isNull(team.deletedAt),
        ),
      )
      .limit(1);
    if (!found) throw new Error("Team not found");
    const [members, pending] = await Promise.all([
      db
        .select({ email: user.email })
        .from(member)
        .innerJoin(user, eq(member.userId, user.id))
        .where(activeMemberWhere(eq(member.organizationId, ctx.orgId ?? ""))),
      db
        .select({ email: invitation.email })
        .from(invitation)
        .where(
          and(
            eq(invitation.organizationId, ctx.orgId ?? ""),
            eq(invitation.status, "pending"),
            gt(invitation.expiresAt, new Date()),
            isNull(invitation.projectId),
            isNull(invitation.deletedAt),
          ),
        ),
    ]);
    return {
      memberEmails: members.map((m) => m.email),
      pendingEmails: pending.map((i) => i.email),
    };
  }, "Invitation context loaded");
}
