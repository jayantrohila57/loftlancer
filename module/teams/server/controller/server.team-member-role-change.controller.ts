import {
  type RunActionContext,
  runAction,
} from "@module/shared/server/run-action";
import { serviceResponseSchema } from "@module/shared/utils/validation/utils.service-response.validation";
import { teamMemberRoleInputSchema } from "../../utils/validation/utils.team-operations.validation";
import { teamMemberRoleOutputSchema } from "../../utils/validation/utils.team-output.validation";
import { teamMemberRoleChangeService } from "../service/server.team-member-role-change.service";
export async function teamMemberRoleChangeController({
  input,
  ctx,
}: {
  input: unknown;
  ctx: RunActionContext;
}) {
  const parsed = teamMemberRoleInputSchema.safeParse(input);
  const scoped = parsed.success
    ? {
        ...ctx,
        teamId: parsed.data.teamId,
        entityId: parsed.data.teamId,
        payload: { role: parsed.data.role },
        targetUserId: parsed.data.userId,
      }
    : ctx;
  const response = await runAction({
    action: "team.member.role.change",
    ctx: scoped,
    audit: true,
    validate: (result) =>
      serviceResponseSchema(teamMemberRoleOutputSchema).parse(result),
    handler: async () => {
      if (!parsed.success)
        return {
          kind: "failed",
          message: "Check the team details.",
          fieldErrors: parsed.error.flatten().fieldErrors,
        };
      return teamMemberRoleChangeService(ctx, parsed.data);
    },
  });
  return serviceResponseSchema(teamMemberRoleOutputSchema).parse(response);
}
