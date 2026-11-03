import {
  type RunActionContext,
  runAction,
} from "@module/shared/server/run-action";
import { teamInvitationListInputSchema } from "../../utils/validation/utils.team-extended.validation";
import { teamInvitationListService } from "../service/server.team-invitation-list.service";
export function teamInvitationListController({
  input,
  ctx,
}: {
  input: unknown;
  ctx: RunActionContext;
}) {
  const parsed = teamInvitationListInputSchema.safeParse(input);
  const scoped = parsed.success
    ? {
        ...ctx,
        teamId: parsed.data.teamId,
        payload: { operation: "invitation-list", scope: "team" },
      }
    : ctx;
  return runAction({
    action: "member.list",
    ctx: scoped,
    audit: false,
    handler: async () => {
      if (!parsed.success)
        return {
          kind: "failed",
          message: "Check the details.",
          fieldErrors: parsed.error.flatten().fieldErrors,
        };
      return teamInvitationListService(ctx, parsed.data);
    },
  });
}
