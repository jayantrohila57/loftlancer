import { teamListController } from "@module/teams/server/controller/server.team-list.controller";
export type GetTeamsContext = {
  userId: string;
  organizationId: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
};
export async function getTeams(context: GetTeamsContext) {
  return teamListController({
    ctx: {
      userId: context.userId,
      orgId: context.organizationId,
      ip: context.ipAddress,
      userAgent: context.userAgent,
    },
  });
}
