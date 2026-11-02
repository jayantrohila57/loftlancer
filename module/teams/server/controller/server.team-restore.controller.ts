import {
  type RunActionContext,
  runAction,
} from "@module/shared/server/run-action";
import { teamGetInputSchema } from "../../utils/validation/utils.team-id.validation";
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
  return runAction({
    action: "team.restore",
    ctx: scoped,
    audit: true,
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
}
