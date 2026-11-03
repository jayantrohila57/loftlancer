import { createOrganizationInvitation } from "@module/organizations/server/service/server.invitation-create.service";
import type { RunActionContext } from "@module/shared/server/run-action";
import type { TeamInvitationCreateInput } from "../../utils/validation/utils.team-extended.validation";
import { teamOutcome } from "./server.team-outcome.service";
export function teamInvitationCreateService(
  ctx: RunActionContext,
  input: TeamInvitationCreateInput,
) {
  return teamOutcome(
    () => createOrganizationInvitation(ctx.userId, ctx.orgId ?? "", input),
    "Invitation sent",
  );
}
