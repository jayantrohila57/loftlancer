import type { RunActionContext } from "@module/shared/server/run-action";
import type { ServiceOutcome } from "@module/shared/utils/types/utils.service-outcome.types";
import type {
  OrganizationInvitationCreateInput,
  OrganizationInvitationCreateOutput,
} from "../../utils/validation/utils.organization-invitations.validation";
import { createOrganizationInvitation } from "./server.invitation-create.service";

export async function organizationInvitationCreateService(
  ctx: RunActionContext,
  input: OrganizationInvitationCreateInput,
): Promise<ServiceOutcome<OrganizationInvitationCreateOutput>> {
  if (!ctx.orgId)
    return { kind: "failed", message: "Select an organization first." };
  if (ctx.orgId !== input.organizationId)
    return {
      kind: "failed",
      message: "The active organization changed. Reload and try again.",
    };

  const created = await createOrganizationInvitation(ctx.userId, ctx.orgId, {
    email: input.email,
    role: input.role,
    teamId: input.teamId,
    projectId: input.projectId,
  });
  return { kind: "success", data: created, message: "Invitation sent." };
}
