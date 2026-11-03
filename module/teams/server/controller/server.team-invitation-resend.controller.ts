import {
  type RunActionContext,
  runAction,
} from "@module/shared/server/run-action";
import { serviceResponseSchema } from "@module/shared/utils/validation/utils.service-response.validation";
import { teamInvitationTargetInputSchema } from "../../utils/validation/utils.team-extended.validation";
import { teamInvitationTargetOutputSchema } from "../../utils/validation/utils.team-output.validation";
import { teamInvitationResendService } from "../service/server.team-invitation-resend.service";
export async function teamInvitationResendController({
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
  const response = await runAction({
    action: "member.invite",
    ctx: scoped,
    audit: true,
    validate: (result) =>
      serviceResponseSchema(teamInvitationTargetOutputSchema).parse(result),
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
  return serviceResponseSchema(teamInvitationTargetOutputSchema).parse(
    response,
  );
}
