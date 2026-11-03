import type { RunActionContext } from "@module/shared/server/run-action";
import type { TeamProjectLinkInput } from "../../utils/validation/utils.team-extended.validation";
import { teamOutcome } from "./server.team-outcome.service";
import { upsertProjectTeamLink } from "./server.team-project-link.service";
export function teamProjectAssignService(
  ctx: RunActionContext,
  input: TeamProjectLinkInput,
) {
  return teamOutcome(
    () =>
      upsertProjectTeamLink({
        organizationId: ctx.orgId ?? "",
        projectId: input.projectId,
        teamId: input.teamId,
        createdBy: ctx.userId,
      }),
    "Team added to project",
  );
}
