import { sendOrganizationInvitationEmail } from "@features/authentication/core/server/authentication.organization-invitation-email";
import { db } from "@loftlancer/drizzle";
import { user } from "@loftlancer/drizzle/schema/auth";
import {
  invitation,
  organization,
} from "@loftlancer/drizzle/schema/organization";
import type { RunActionContext } from "@module/shared/server/run-action";
import { and, eq, isNull } from "drizzle-orm";
import type { TeamInvitationTargetInput } from "../../utils/validation/utils.team-extended.validation";
import { teamOutcome } from "./server.team-outcome.service";
export function teamInvitationResendService(
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
      .select({
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        organizationName: organization.name,
      })
      .from(invitation)
      .innerJoin(organization, eq(invitation.organizationId, organization.id))
      .where(and(scope, isNull(organization.deletedAt)))
      .limit(1);
    if (!row) throw new Error("invitation_not_pending");
    const [actor] = await db
      .select({ name: user.name, email: user.email })
      .from(user)
      .where(eq(user.id, ctx.userId))
      .limit(1);
    await sendOrganizationInvitationEmail({
      invitationId: row.id,
      email: row.email,
      role: row.role,
      organizationId: ctx.orgId ?? "",
      organizationName: row.organizationName,
      inviterUserId: ctx.userId,
      inviterName: actor?.name || actor?.email || "Organization member",
    });
    const now = new Date();
    const [updated] = await db
      .update(invitation)
      .set({
        lastSentAt: now,
        updatedAt: now,
        expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      })
      .where(scope)
      .returning({ id: invitation.id });
    if (!updated) throw new Error("invitation_not_pending");
    return updated;
  }, "Invitation resent");
}
