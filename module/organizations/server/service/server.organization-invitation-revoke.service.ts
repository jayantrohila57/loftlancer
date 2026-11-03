import { db } from "@loftlancer/drizzle";
import { invitation } from "@loftlancer/drizzle/schema/organization";
import type { RunActionContext } from "@module/shared/server/run-action";
import type { ServiceOutcome } from "@module/shared/utils/types/utils.service-outcome.types";
import { and, eq, isNull } from "drizzle-orm";
import type {
  OrganizationInvitationMutationOutput,
  OrganizationInvitationScopedIdInput,
} from "../../utils/validation/utils.organization-invitations.validation";

export async function organizationInvitationRevokeService(
  ctx: RunActionContext,
  input: OrganizationInvitationScopedIdInput,
): Promise<ServiceOutcome<OrganizationInvitationMutationOutput>> {
  if (!ctx.orgId)
    return { kind: "failed", message: "Select an organization first." };
  const [row] = await db
    .update(invitation)
    .set({
      status: "canceled",
      revokedAt: new Date(),
      revokedBy: ctx.userId,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(invitation.id, input.invitationId),
        eq(invitation.organizationId, ctx.orgId),
        input.projectId ? eq(invitation.projectId, input.projectId) : undefined,
        eq(invitation.status, "pending"),
        isNull(invitation.deletedAt),
      ),
    )
    .returning({ id: invitation.id });
  if (!row) return { kind: "failed", message: "Pending invitation not found." };
  return {
    kind: "success",
    data: { success: true },
    message: "Invitation revoked.",
  };
}
