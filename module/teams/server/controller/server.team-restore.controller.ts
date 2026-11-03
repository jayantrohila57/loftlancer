import {
  type RunActionContext,
  runAction,
} from "@module/shared/server/run-action";
import { serviceResponseSchema } from "@module/shared/utils/validation/utils.service-response.validation";
import { teamGetInputSchema } from "../../utils/validation/utils.team-id.validation";
import { teamRestoreOutputSchema } from "../../utils/validation/utils.team-output.validation";
import { teamRestoreService } from "../service/server.team-restore.service";
export async function teamRestoreController({
  input,
  ctx,
}: {
  input: unknown;
  ctx: RunActionContext;
}) {
  const parsed = teamGetInputSchema.safeParse(input);
  const scoped = parsed.success
    ? { ...ctx, entityId: parsed.data.teamId }
    : ctx;
  const response = await runAction({
    action: "team.restore",
    ctx: scoped,
    audit: true,
    validate: (result) =>
      serviceResponseSchema(teamRestoreOutputSchema).parse(result),
    handler: async () => {
      if (!parsed.success)
        return {
          kind: "failed",
          message: "Check the team details.",
          fieldErrors: parsed.error.flatten().fieldErrors,
        };
      return teamRestoreService(ctx, parsed.data);
    },
  });
  return serviceResponseSchema(teamRestoreOutputSchema).parse(response);
}
