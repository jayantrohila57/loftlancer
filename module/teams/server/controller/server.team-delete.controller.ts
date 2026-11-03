import {
  type RunActionContext,
  runAction,
} from "@module/shared/server/run-action";
import { serviceResponseSchema } from "@module/shared/utils/validation/utils.service-response.validation";
import { teamGetInputSchema } from "../../utils/validation/utils.team-id.validation";
import { teamDeleteOutputSchema } from "../../utils/validation/utils.team-output.validation";
import { teamDeleteService } from "../service/server.team-delete.service";
export async function teamDeleteController({
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
    action: "team.delete",
    ctx: scoped,
    audit: true,
    validate: (result) =>
      serviceResponseSchema(teamDeleteOutputSchema).parse(result),
    handler: async () => {
      if (!parsed.success)
        return {
          kind: "failed",
          message: "Check the team details.",
          fieldErrors: parsed.error.flatten().fieldErrors,
        };
      return teamDeleteService(ctx, parsed.data);
    },
  });
  return serviceResponseSchema(teamDeleteOutputSchema).parse(response);
}
