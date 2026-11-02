import {
  type RunActionContext,
  runAction,
} from "@module/shared/server/run-action";
import { teamGetInputSchema } from "../../utils/validation/utils.team-id.validation";
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
  return runAction({
    action: "team.delete",
    ctx: scoped,
    audit: true,
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
}
