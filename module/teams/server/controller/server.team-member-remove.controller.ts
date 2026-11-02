import {
  type RunActionContext,
  runAction,
} from "@module/shared/server/run-action";
import { teamMemberInputSchema } from "../../utils/validation/utils.team-operations.validation";
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
  return runAction({
    action: "team.member.remove",
    ctx: scoped,
    audit: true,
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
}
