import "server-only";
import { teamInvitationListController } from "../controller/server.team-invitation-list.controller";
import { loadTeamsContext } from "./server.team-overview.page";
export async function loadTeamInvitations(slug: string, teamId: string) {
  const { ctx } = await loadTeamsContext(slug);
  return teamInvitationListController({ ctx, input: { teamId } });
}
