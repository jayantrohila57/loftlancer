import "server-only";
import { teamMembersController } from "../controller/server.team-members.controller";
import { loadTeamsContext } from "./server.team-overview.page";
export async function loadTeamMembers(slug: string, teamId: string) {
  const { ctx } = await loadTeamsContext(slug);
  return teamMembersController({ ctx, input: { teamId } });
}
