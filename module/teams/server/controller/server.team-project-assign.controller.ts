import { requireAction } from "@features/authorization/core/server/authorization.require-action";
import {
  buildAccessContext,
  type RunActionContext,
  runAction,
} from "@module/shared/server/run-action";
import { serviceResponseSchema } from "@module/shared/utils/validation/utils.service-response.validation";
import { teamProjectLinkInputSchema } from "../../utils/validation/utils.team-extended.validation";
import { teamProjectLinkOutputSchema } from "../../utils/validation/utils.team-output.validation";
import { teamProjectAssignService } from "../service/server.team-project-assign.service";
export async function teamProjectAssignController({
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
        entityId: parsed.data.teamId,
        projectId: parsed.data.projectId,
        payload: {
          operation: "project-assign",
          scope: "team",
          teamId: parsed.data.teamId,
        },
      }
    : ctx;
  const response = await runAction({
    action: "project.assign_team",
    ctx: scoped,
    audit: true,
    validate: (result) =>
      serviceResponseSchema(teamProjectLinkOutputSchema).parse(result),
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
      return teamProjectAssignService(ctx, parsed.data);
    },
  });
  return serviceResponseSchema(teamProjectLinkOutputSchema).parse(response);
}
