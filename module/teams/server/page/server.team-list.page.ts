import "server-only";
import { teamListController } from "../controller/server.team-list.controller";
import { loadTeamsContext } from "./server.team-overview.page";
export async function loadTeamsList(org: string) {
  const scope = await loadTeamsContext(org);
  return { ...scope, response: await teamListController({ ctx: scope.ctx }) };
}
