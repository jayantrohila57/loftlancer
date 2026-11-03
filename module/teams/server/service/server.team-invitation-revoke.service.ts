import { db } from "@loftlancer/db";
import { invitation } from "@loftlancer/db/schema/organization";
import type { RunActionContext } from "@module/shared/server/run-action";
import { and, eq, isNull } from "drizzle-orm";
import type { TeamInvitationTargetInput } from "../../utils/validation/utils.team-extended.validation";
import { teamOutcome } from "./server.team-outcome.service";
export function teamInvitationRevokeService(
  ctx: RunActionContext,
  input: TeamInvitationTargetInput,
) {
  return teamOutcome(async () => {
    const scope = and(
      eq(invitation.id, input.invitationId),
      eq(invitation.organizationId, ctx.orgId ?? ""),
      eq(invitation.teamId, input.teamId),
      eq(invitation.status, "pending"),
      isNull(invitation.deletedAt),
    );
    const [row] = await db
      .update(invitation)
      .set({
        status: "canceled",
        revokedAt: new Date(),
        revokedBy: ctx.userId,
        updatedAt: new Date(),
      })
      .where(scope)
      .returning({ id: invitation.id });
    if (!row) throw new Error("invitation_not_pending");
    return row;
  }, "Invitation revoked");
}
