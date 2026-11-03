import { requireAction } from "@loftlancer/api/actions/require-action";
import {
  buildAccessContext,
  type RunActionContext,
  runAction,
} from "@module/shared/server/run-action";
import { teamInvitationCreateInputSchema } from "../../utils/validation/utils.team-extended.validation";
import { teamInvitationCreateService } from "../service/server.team-invitation-create.service";
export function teamInvitationCreateController({
  input,
  ctx,
}: {
  input: unknown;
  ctx: RunActionContext;
}) {
  const parsed = teamInvitationCreateInputSchema.safeParse(input);
  const scoped = parsed.success
    ? {
        ...ctx,
        teamId: parsed.data.teamId,
        payload: {
          operation: "invitation-create",
          scope: "team",
          role: parsed.data.role,
        },
      }
    : ctx;
  return runAction({
    action: "member.invite",
    ctx: scoped,
    audit: true,
    authorize: async () => {
      if (!parsed.success) return;
      await requireAction("team.member.add", {
        ...buildAccessContext(ctx),
        teamId: parsed.data.teamId,
        audit: false,
      });
    },
    handler: async () => {
      if (!parsed.success)
        return {
          kind: "failed",
          message: "Check the details.",
          fieldErrors: parsed.error.flatten().fieldErrors,
        };
      return teamInvitationCreateService(ctx, parsed.data);
    },
  });
}
