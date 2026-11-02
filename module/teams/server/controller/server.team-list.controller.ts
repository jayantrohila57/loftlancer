import {
  type RunActionContext,
  runAction,
} from "@module/shared/server/run-action";
import { serviceResponseSchema } from "@module/shared/utils/validation/utils.service-response.validation";
import { type TeamDto, teamDtoSchema } from "../../utils/types/utils.team.dto";
import { teamListService } from "../service/server.team-list.service";

export async function teamListController({
  ctx,
}: {
  input?: unknown;
  ctx: RunActionContext;
}) {
  const response = await runAction<TeamDto>({
    action: "member.list",
    ctx,
    audit: false,
    validate: (response) =>
      serviceResponseSchema(teamDtoSchema).parse(response),
    handler: async () => {
      return teamListService(ctx);
    },
  });
  return serviceResponseSchema(teamDtoSchema).parse(response);
}
