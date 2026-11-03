import {
  type RunActionContext,
  runAction,
} from "@module/shared/server/run-action";
import { teamInvitationTargetInputSchema } from "../../utils/validation/utils.team-extended.validation";
import { teamInvitationResendService } from "../service/server.team-invitation-resend.service";
export function teamInvitationResendController({
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
        payload: {
          operation: "invitation-resend",
          scope: "team",
          teamId: parsed.data.teamId,
        },
      }
    : ctx;
  return runAction({
    action: "member.invite",
    ctx: scoped,
    audit: true,
    handler: async () => {
      if (!parsed.success)
        return {
          kind: "failed",
          message: "Check the details.",
          fieldErrors: parsed.error.flatten().fieldErrors,
        };
      return teamInvitationResendService(ctx, parsed.data);
    },
  });
}
