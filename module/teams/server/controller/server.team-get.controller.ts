import {
  type RunActionContext,
  runAction,
} from "@module/shared/server/run-action";
import { serviceResponseSchema } from "@module/shared/utils/validation/utils.service-response.validation";
import { type TeamDto, teamDtoSchema } from "../../utils/types/utils.team.dto";
import { teamGetInputSchema } from "../../utils/validation/utils.team-id.validation";
import { teamGetService } from "../service/server.team-get.service";

export async function teamGetController({
  input,
  ctx,
}: {
  input?: unknown;
  ctx: RunActionContext;
}) {
  const parsed = teamGetInputSchema.safeParse(input);
  const scoped = parsed.success ? { ...ctx, teamId: parsed.data.teamId } : ctx;
  const response = await runAction<TeamDto>({
    action: "team.member.list",
    ctx: scoped,
    audit: false,
    validate: (response) =>
      serviceResponseSchema(teamDtoSchema).parse(response),
    handler: async () => {
      if (!parsed.success)
        return {
          kind: "failed" as const,
          message: "Check the team details.",
          fieldErrors: parsed.error.flatten().fieldErrors,
        };
      return teamGetService(ctx, parsed.data);
    },
  });
  return serviceResponseSchema(teamDtoSchema).parse(response);
}
