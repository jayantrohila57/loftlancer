import { sendOrganizationInvitationEmail } from "@loftlancer/auth/organization-invitation-email";
import { db } from "@loftlancer/db";
import { user } from "@loftlancer/db/schema/auth";
import { invitation, organization } from "@loftlancer/db/schema/organization";
import { project } from "@loftlancer/db/schema/projects";
import type { RunActionContext } from "@module/shared/server/run-action";
import type { ServiceOutcome } from "@module/shared/utils/types/utils.service-outcome.types";
import { and, eq, isNull } from "drizzle-orm";
import type {
  OrganizationInvitationMutationOutput,
  OrganizationInvitationScopedIdInput,
} from "../../utils/validation/utils.organization-invitations.validation";

export async function organizationInvitationResendService(
  ctx: RunActionContext,
  input: OrganizationInvitationScopedIdInput,
): Promise<ServiceOutcome<OrganizationInvitationMutationOutput>> {
  if (!ctx.orgId)
    return { kind: "failed", message: "Select an organization first." };
  const organizationId = ctx.orgId;
  const [row] = await db
    .select({
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      organizationName: organization.name,
      projectName: project.name,
    })
    .from(invitation)
    .innerJoin(organization, eq(organization.id, invitation.organizationId))
    .leftJoin(project, eq(project.id, invitation.projectId))
    .where(
      and(
        eq(invitation.id, input.invitationId),
        eq(invitation.organizationId, organizationId),
        input.projectId ? eq(invitation.projectId, input.projectId) : undefined,
        eq(invitation.status, "pending"),
        isNull(invitation.deletedAt),
        isNull(organization.deletedAt),
        isNull(project.deletedAt),
      ),
    )
    .limit(1);
  if (!row) return { kind: "failed", message: "Pending invitation not found." };
  const [inviter] = await db
    .select({ name: user.name, email: user.email })
    .from(user)
    .where(eq(user.id, ctx.userId))
    .limit(1);

  const now = new Date();
  await sendOrganizationInvitationEmail({
    invitationId: row.id,
    email: row.email,
    role: row.role,
    organizationId,
    inviterUserId: ctx.userId,
    organizationName: row.projectName
      ? `project ${row.projectName} in ${row.organizationName}`
      : row.organizationName,
    inviterName: inviter?.name || inviter?.email || "Organization member",
  });
  await db
    .update(invitation)
    .set({
      lastSentAt: now,
      updatedAt: now,
      expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    })
    .where(
      and(
        eq(invitation.id, row.id),
        eq(invitation.organizationId, organizationId),
        eq(invitation.status, "pending"),
      ),
    );
  return {
    kind: "success",
    data: { success: true },
    message: "Invitation resent.",
  };
}
