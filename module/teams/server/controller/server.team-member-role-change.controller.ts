import {
  type RunActionContext,
  runAction,
} from "@module/shared/server/run-action";
import { teamMemberRoleInputSchema } from "../../utils/validation/utils.team-operations.validation";
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
  return runAction({
    action: "team.member.role.change",
    ctx: scoped,
    audit: true,
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
}
