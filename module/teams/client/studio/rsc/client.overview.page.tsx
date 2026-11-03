import dynamic from "next/dynamic";
import { loadTeamOverview } from "../../../server/page/server.team-overview.page";
import { TeamOverviewSkeleton } from "../skeletons/client.team-overview.skeleton";

const Boundary = dynamic(
  () =>
    import("../components/client.overview.boundary").then(
      (m) => m.TeamOverviewBoundary,
    ),
  { loading: () => <TeamOverviewSkeleton /> },
);
export const metadata = {
  title: "Team overview",
  description: "Team members and linked projects.",
};
export async function TeamOverviewPage({
  params,
}: {
  params: Promise<{ org: string; teamId: string }>;
}) {
  const { org, teamId } = await params;
  const { response, ctx } = await loadTeamOverview(org, teamId);
  return <Boundary orgId={ctx.orgId} teamId={teamId} response={response} />;
}
