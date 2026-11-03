import {
  type RunActionContext,
  runAction,
} from "@module/shared/server/run-action";
import { serviceResponseSchema } from "@module/shared/utils/validation/utils.service-response.validation";
import { teamInvitationListInputSchema } from "../../utils/validation/utils.team-extended.validation";
import { teamInvitationListOutputSchema } from "../../utils/validation/utils.team-output.validation";
import { teamInvitationListService } from "../service/server.team-invitation-list.service";
export async function teamInvitationListController({
  input,
  ctx,
}: {
  input: unknown;
  ctx: RunActionContext;
}) {
  const parsed = teamInvitationListInputSchema.safeParse(input);
  const scoped = parsed.success
    ? {
        ...ctx,
        teamId: parsed.data.teamId,
        payload: { operation: "invitation-list", scope: "team" },
      }
    : ctx;
  const response = await runAction({
    action: "member.list",
    ctx: scoped,
    audit: false,
    validate: (result) =>
      serviceResponseSchema(teamInvitationListOutputSchema).parse(result),
    handler: async () => {
      if (!parsed.success)
        return {
          kind: "failed",
          message: "Check the details.",
          fieldErrors: parsed.error.flatten().fieldErrors,
        };
      return teamInvitationListService(ctx, parsed.data);
    },
  });
  return serviceResponseSchema(teamInvitationListOutputSchema).parse(response);
}
