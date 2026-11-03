import type { RunActionContext } from "@module/shared/server/run-action";
import type { TeamProjectLinkInput } from "../../utils/validation/utils.team-extended.validation";
import { teamOutcome } from "./server.team-outcome.service";
import { softDeleteProjectTeamLink } from "./server.team-project-link.service";
export function teamProjectRemoveService(
  ctx: RunActionContext,
  input: TeamProjectLinkInput,
) {
  return teamOutcome(
    () =>
      softDeleteProjectTeamLink({
        organizationId: ctx.orgId ?? "",
        projectId: input.projectId,
        teamId: input.teamId,
        actorUserId: ctx.userId,
      }),
    "Team removed from project",
  );
}
