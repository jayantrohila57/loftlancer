import { requireAction } from "@loftlancer/api/actions/require-action";
import {
  buildAccessContext,
  type RunActionContext,
  runAction,
} from "@module/shared/server/run-action";
import { teamProjectLinkInputSchema } from "../../utils/validation/utils.team-extended.validation";
import { teamProjectRemoveService } from "../service/server.team-project-remove.service";
export function teamProjectRemoveController({
  input,
  ctx,
}: {
  input: unknown;
  ctx: RunActionContext;
}) {
  const parsed = teamProjectLinkInputSchema.safeParse(input);
  const scoped = parsed.success
    ? {
        ...ctx,
        teamId: parsed.data.teamId,
        projectId: parsed.data.projectId,
        payload: { operation: "project-remove", scope: "team" },
      }
    : ctx;
  return runAction({
    action: "project.assign_team",
    ctx: scoped,
    audit: true,
    authorize: async () => {
      if (!parsed.success) return;
      await requireAction("project.read", {
        ...buildAccessContext(ctx),
        projectId: parsed.data.projectId,
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
      return teamProjectRemoveService(ctx, parsed.data);
    },
  });
}
