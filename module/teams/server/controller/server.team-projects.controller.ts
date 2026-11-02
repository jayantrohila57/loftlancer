import {
  type RunActionContext,
  runAction,
} from "@module/shared/server/run-action";
import { teamGetInputSchema } from "../../utils/validation/utils.team-id.validation";
import { teamProjectsService } from "../service/server.team-projects.service";
export function teamProjectsController({
  input,
  ctx,
}: {
  input: unknown;
  ctx: RunActionContext;
}) {
  const parsed = teamGetInputSchema.safeParse(input);
  return runAction({
    action: "team.member.list",
    ctx: parsed.success ? { ...ctx, teamId: parsed.data.teamId } : ctx,
    audit: false,
    handler: async () => {
      if (!parsed.success) return { kind: "failed", message: "Select a team." };
      return teamProjectsService(ctx, parsed.data);
    },
  });
}
