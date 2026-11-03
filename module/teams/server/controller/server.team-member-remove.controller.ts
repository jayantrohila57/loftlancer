import {
  type RunActionContext,
  runAction,
} from "@module/shared/server/run-action";
import { serviceResponseSchema } from "@module/shared/utils/validation/utils.service-response.validation";
import { teamMemberInputSchema } from "../../utils/validation/utils.team-operations.validation";
import { teamMemberOutputSchema } from "../../utils/validation/utils.team-output.validation";
import { teamMemberRemoveService } from "../service/server.team-member-remove.service";
export async function teamMemberRemoveController({
  input,
  ctx,
}: {
  input: unknown;
  ctx: RunActionContext;
}) {
  const parsed = teamMemberInputSchema.safeParse(input);
  const scoped = parsed.success
    ? {
        ...ctx,
        teamId: parsed.data.teamId,
        entityId: parsed.data.teamId,
        targetUserId: parsed.data.userId,
      }
    : ctx;
  const response = await runAction({
    action: "team.member.remove",
    ctx: scoped,
    audit: true,
    validate: (result) =>
      serviceResponseSchema(teamMemberOutputSchema).parse(result),
    handler: async () => {
      if (!parsed.success)
        return {
          kind: "failed",
          message: "Check the team details.",
          fieldErrors: parsed.error.flatten().fieldErrors,
        };
      return teamMemberRemoveService(ctx, parsed.data);
    },
  });
  return serviceResponseSchema(teamMemberOutputSchema).parse(response);
}
