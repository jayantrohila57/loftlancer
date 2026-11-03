import {
  type RunActionContext,
  runAction,
} from "@module/shared/server/run-action";
import { teamGetInputSchema } from "../../utils/validation/utils.team-id.validation";
import { teamInvitationContextService } from "../service/server.team-invitation-context.service";
export function teamInvitationContextController({
  input,
  ctx,
}: {
  input: unknown;
  ctx: RunActionContext;
}) {
  const parsed = teamGetInputSchema.safeParse(input);
  const scoped = parsed.success
    ? {
        ...ctx,
        teamId: parsed.data.teamId,
        payload: { operation: "invitation-context", scope: "team" },
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
      return teamInvitationContextService(ctx, parsed.data);
    },
  });
}
