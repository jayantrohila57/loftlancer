import {
  type RunActionContext,
  runAction,
} from "@module/shared/server/run-action";
import { serviceResponseSchema } from "@module/shared/utils/validation/utils.service-response.validation";
import { teamGetInputSchema } from "../../utils/validation/utils.team-id.validation";
import { teamInvitationContextOutputSchema } from "../../utils/validation/utils.team-output.validation";
import { teamInvitationContextService } from "../service/server.team-invitation-context.service";
export async function teamInvitationContextController({
  input,
  ctx,
}: {
  input: unknown;
  ctx: RunActionContext;
}) {
  const parsed = teamGetInputSchema.safeParse(input);
  const scoped = parsed.success
    ? {
        ...ctx,
        teamId: parsed.data.teamId,
        payload: { operation: "invitation-context", scope: "team" },
      }
    : ctx;
  const response = await runAction({
    action: "member.list",
    ctx: scoped,
    audit: false,
    validate: (result) =>
      serviceResponseSchema(teamInvitationContextOutputSchema).parse(result),
    handler: async () => {
      if (!parsed.success)
        return {
          kind: "failed",
          message: "Check the details.",
          fieldErrors: parsed.error.flatten().fieldErrors,
        };
      return teamInvitationContextService(ctx, parsed.data);
    },
  });
  return serviceResponseSchema(teamInvitationContextOutputSchema).parse(
    response,
  );
}
