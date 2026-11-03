import { requireAction } from "@features/authorization/core/server/authorization.require-action";
import {
  buildAccessContext,
  type RunActionContext,
  runAction,
} from "@module/shared/server/run-action";
import { serviceResponseSchema } from "@module/shared/utils/validation/utils.service-response.validation";
import { teamInvitationCreateInputSchema } from "../../utils/validation/utils.team-extended.validation";
import { teamInvitationCreateOutputSchema } from "../../utils/validation/utils.team-output.validation";
import { teamInvitationCreateService } from "../service/server.team-invitation-create.service";
export async function teamInvitationCreateController({
  input,
  ctx,
}: {
  input: unknown;
  ctx: RunActionContext;
}) {
  const parsed = teamInvitationCreateInputSchema.safeParse(input);
  const scoped = parsed.success
    ? {
        ...ctx,
        teamId: parsed.data.teamId,
        payload: {
          operation: "invitation-create",
          scope: "team",
          teamId: parsed.data.teamId,
          role: parsed.data.role,
        },
      }
    : ctx;
  const response = await runAction({
    action: "member.invite",
    ctx: scoped,
    audit: true,
    validate: (result) =>
      serviceResponseSchema(teamInvitationCreateOutputSchema).parse(result),
    authorize: async () => {
      if (!parsed.success) return;
      await requireAction("team.member.add", {
        ...buildAccessContext(ctx),
        teamId: parsed.data.teamId,
        audit: false,
      });
    },
    handler: async () => {
      if (!parsed.success)
        return {
          kind: "failed",
          message: "Check the details.",
          fieldErrors: parsed.error.flatten().fieldErrors,
        };
      return teamInvitationCreateService(ctx, parsed.data);
    },
  });
  return serviceResponseSchema(teamInvitationCreateOutputSchema).parse(
    response,
  );
}
