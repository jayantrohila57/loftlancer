import {
  type RunActionContext,
  runAction,
} from "@module/shared/server/run-action";
import { teamUpdateInputSchema } from "../../utils/validation/utils.team-operations.validation";
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
    ? { ...ctx, teamId: parsed.data.teamId, entityId: parsed.data.teamId }
    : ctx;
  return runAction({
    action: "team.update",
    ctx: scoped,
    audit: true,
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
}
