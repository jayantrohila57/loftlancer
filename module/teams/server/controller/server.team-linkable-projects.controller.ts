import {
  type RunActionContext,
  runAction,
} from "@module/shared/server/run-action";
import { serviceResponseSchema } from "@module/shared/utils/validation/utils.service-response.validation";
import { teamGetInputSchema } from "../../utils/validation/utils.team-id.validation";
import { teamLinkableProjectOutputSchema } from "../../utils/validation/utils.team-output.validation";
import { teamLinkableProjectsService } from "../service/server.team-linkable-projects.service";
export async function teamLinkableProjectsController({
  input,
  ctx,
}: {
  input: unknown;
  ctx: RunActionContext;
}) {
  const parsed = teamGetInputSchema.safeParse(input);
  const response = await runAction({
    action: "member.list",
    ctx: parsed.success ? { ...ctx, teamId: parsed.data.teamId } : ctx,
    audit: false,
    validate: (result) =>
      serviceResponseSchema(teamLinkableProjectOutputSchema).parse(result),
    handler: async () => {
      if (!parsed.success) return { kind: "failed", message: "Select a team." };
      return teamLinkableProjectsService(ctx, parsed.data);
    },
  });
  return serviceResponseSchema(teamLinkableProjectOutputSchema).parse(response);
}
