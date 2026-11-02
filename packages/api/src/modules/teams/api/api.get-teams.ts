import { teamListController } from "@module/teams/server/controller/server.team-list.controller";
import { unwrapTeamList } from "@module/teams/server/handlers/server.legacy-response.handler";
export type GetTeamsContext = {
  userId: string;
  organizationId: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
};
export async function getTeams(context: GetTeamsContext) {
  return unwrapTeamList(
    await teamListController({
      ctx: {
        userId: context.userId,
        orgId: context.organizationId,
        ip: context.ipAddress,
        userAgent: context.userAgent,
      },
    }),
  );
}
