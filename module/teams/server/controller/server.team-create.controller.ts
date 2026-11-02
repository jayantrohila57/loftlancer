import {
  type RunActionContext,
  runAction,
} from "@module/shared/server/run-action";
import { serviceResponseSchema } from "@module/shared/utils/validation/utils.service-response.validation";
import { type TeamDto, teamDtoSchema } from "../../utils/types/utils.team.dto";
import { teamCreateInputSchema } from "../../utils/validation/utils.create-team.validation";
import { teamCreateService } from "../service/server.team-create.service";

export async function teamCreateController({
  input,
  ctx,
}: {
  input?: unknown;
  ctx: RunActionContext;
}) {
  const parsed = teamCreateInputSchema.safeParse(input);
  const response = await runAction<TeamDto>({
    action: "team.create",
    ctx: parsed.success ? { ...ctx, payload: { name: parsed.data.name } } : ctx,
    audit: true,
    validate: (response) =>
      serviceResponseSchema(teamDtoSchema).parse(response),
    handler: async () => {
      if (!parsed.success)
        return {
          kind: "failed" as const,
          message: "Check the team details.",
          fieldErrors: parsed.error.flatten().fieldErrors,
        };
      return teamCreateService(ctx, parsed.data);
    },
  });
  return serviceResponseSchema(teamDtoSchema).parse(response);
}
