import "server-only";
import { teamProjectsController } from "../controller/server.team-projects.controller";
import { loadTeamsContext } from "./server.team-overview.page";
export async function loadTeamProjects(slug: string, teamId: string) {
  const { ctx } = await loadTeamsContext(slug);
  return teamProjectsController({ ctx, input: { teamId } });
}
