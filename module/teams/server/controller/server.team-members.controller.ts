import {
  type RunActionContext,
  runAction,
} from "@module/shared/server/run-action";
import { serviceResponseSchema } from "@module/shared/utils/validation/utils.service-response.validation";
import { teamGetInputSchema } from "../../utils/validation/utils.team-id.validation";
import { teamMemberListOutputSchema } from "../../utils/validation/utils.team-output.validation";
import { teamMembersService } from "../service/server.team-members.service";
export async function teamMembersController({
  input,
  ctx,
}: {
  input: unknown;
  ctx: RunActionContext;
}) {
  const parsed = teamGetInputSchema.safeParse(input);
  const scoped = parsed.success
    ? { ...ctx, teamId: parsed.data.teamId, entityId: parsed.data.teamId }
    : ctx;
  const response = await runAction({
    action: "team.member.list",
    ctx: scoped,
    audit: false,
    validate: (result) =>
      serviceResponseSchema(teamMemberListOutputSchema).parse(result),
    handler: async () => {
      if (!parsed.success)
        return {
          kind: "failed",
          message: "Check the team details.",
          fieldErrors: parsed.error.flatten().fieldErrors,
        };
      return teamMembersService(ctx, parsed.data);
    },
  });
  return serviceResponseSchema(teamMemberListOutputSchema).parse(response);
}
