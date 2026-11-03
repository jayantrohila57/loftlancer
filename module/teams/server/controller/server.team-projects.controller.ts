import {
  type RunActionContext,
  runAction,
} from "@module/shared/server/run-action";
import { serviceResponseSchema } from "@module/shared/utils/validation/utils.service-response.validation";
import { teamGetInputSchema } from "../../utils/validation/utils.team-id.validation";
import { teamProjectOutputSchema } from "../../utils/validation/utils.team-output.validation";
import { teamProjectsService } from "../service/server.team-projects.service";
export async function teamProjectsController({
  input,
  ctx,
}: {
  input: unknown;
  ctx: RunActionContext;
}) {
  const parsed = teamGetInputSchema.safeParse(input);
  const response = await runAction({
    action: "team.member.list",
    ctx: parsed.success ? { ...ctx, teamId: parsed.data.teamId } : ctx,
    audit: false,
    validate: (result) =>
      serviceResponseSchema(teamProjectOutputSchema).parse(result),
    handler: async () => {
      if (!parsed.success) return { kind: "failed", message: "Select a team." };
      return teamProjectsService(ctx, parsed.data);
    },
  });
  return serviceResponseSchema(teamProjectOutputSchema).parse(response);
}
