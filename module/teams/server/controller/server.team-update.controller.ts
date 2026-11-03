import {
  type RunActionContext,
  runAction,
} from "@module/shared/server/run-action";
import { serviceResponseSchema } from "@module/shared/utils/validation/utils.service-response.validation";
import { teamUpdateInputSchema } from "../../utils/validation/utils.team-operations.validation";
import { teamUpdateOutputSchema } from "../../utils/validation/utils.team-output.validation";
import { teamUpdateService } from "../service/server.team-update.service";
export async function teamUpdateController({
  input,
  ctx,
}: {
  input: unknown;
  ctx: RunActionContext;
}) {
  const parsed = teamUpdateInputSchema.safeParse(input);
  const scoped = parsed.success
    ? {
        ...ctx,
        teamId: parsed.data.teamId,
        entityId: parsed.data.teamId,
        payload: { name: parsed.data.name },
      }
    : ctx;
  const response = await runAction({
    action: "team.update",
    ctx: scoped,
    audit: true,
    validate: (result) =>
      serviceResponseSchema(teamUpdateOutputSchema).parse(result),
    handler: async () => {
      if (!parsed.success)
        return {
          kind: "failed",
          message: "Check the team details.",
          fieldErrors: parsed.error.flatten().fieldErrors,
        };
      return teamUpdateService(ctx, parsed.data);
    },
  });
  return serviceResponseSchema(teamUpdateOutputSchema).parse(response);
}
