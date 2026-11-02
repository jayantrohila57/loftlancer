import {
  type RunActionContext,
  runAction,
} from "@module/shared/server/run-action";
import { teamGetInputSchema } from "../../utils/validation/utils.team-id.validation";
import { teamAvailableMembersService } from "../service/server.team-available-members.service";
export async function teamAvailableMembersController({
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
    action: "team.member.add",
    ctx: scoped,
    audit: false,
    handler: async () => {
      if (!parsed.success)
        return {
          kind: "failed",
          message: "Check the team details.",
          fieldErrors: parsed.error.flatten().fieldErrors,
        };
      return teamAvailableMembersService(ctx, parsed.data);
    },
  });
}
