import {
  type RunActionContext,
  runAction,
} from "@module/shared/server/run-action";
import { teamGetInputSchema } from "../../utils/validation/utils.team-id.validation";
import { teamLinkableProjectsService } from "../service/server.team-linkable-projects.service";
export function teamLinkableProjectsController({
  input,
  ctx,
}: {
  input: unknown;
  ctx: RunActionContext;
}) {
  const parsed = teamGetInputSchema.safeParse(input);
  return runAction({
    action: "member.list",
    ctx: parsed.success ? { ...ctx, teamId: parsed.data.teamId } : ctx,
    audit: false,
    handler: async () => {
      if (!parsed.success) return { kind: "failed", message: "Select a team." };
      return teamLinkableProjectsService(ctx, parsed.data);
    },
  });
}
