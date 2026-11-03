import {
  type RunActionContext,
  runAction,
} from "@module/shared/server/run-action";
import { teamInvitationTargetInputSchema } from "../../utils/validation/utils.team-extended.validation";
import { teamInvitationRevokeService } from "../service/server.team-invitation-revoke.service";
export function teamInvitationRevokeController({
  input,
  ctx,
}: {
  input: unknown;
  ctx: RunActionContext;
}) {
  const parsed = teamInvitationTargetInputSchema.safeParse(input);
  const scoped = parsed.success
    ? {
        ...ctx,
        teamId: parsed.data.teamId,
        entityId: parsed.data.invitationId,
        payload: { operation: "invitation-revoke", scope: "team" },
      }
    : ctx;
  return runAction({
    action: "invitation.cancel",
    ctx: scoped,
    audit: true,
    handler: async () => {
      if (!parsed.success)
        return {
          kind: "failed",
          message: "Check the details.",
          fieldErrors: parsed.error.flatten().fieldErrors,
        };
      return teamInvitationRevokeService(ctx, parsed.data);
    },
  });
}
