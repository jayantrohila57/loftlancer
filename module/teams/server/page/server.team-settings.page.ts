import "server-only";
import { teamGetController } from "../controller/server.team-get.controller";
import { loadTeamsContext } from "./server.team-overview.page";
export async function loadTeamSettings(slug: string, teamId: string) {
  const { ctx } = await loadTeamsContext(slug);
  return teamGetController({ ctx, input: { teamId } });
}
