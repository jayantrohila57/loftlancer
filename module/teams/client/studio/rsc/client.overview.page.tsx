import dynamic from "next/dynamic";
import { loadTeamOverview } from "../../../server/page/server.team-overview.page";
import { TeamOverviewSkeleton } from "../skeletons/client.team-overview.skeleton";
import { TeamOverviewAccessGuideSection } from "./client.overview.access-guide.section";
import { TeamOverviewProfileSection } from "./client.overview.profile.section";

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
  const team =
    response.status === "success" &&
    response.data &&
    !Array.isArray(response.data)
      ? response.data
      : null;
  return (
    <Boundary orgId={ctx.orgId} teamId={teamId} response={response}>
      {team ? <TeamOverviewProfileSection team={team} /> : null}
      <TeamOverviewAccessGuideSection />
    </Boundary>
  );
}
