import dynamic from "next/dynamic";
import { type ReactNode, Suspense } from "react";
import { loadTeamOverview } from "../../../server/page/server.team-overview.page";
import { TeamsSectionSkeleton } from "../skeletons/client.section.skeleton";

const Tabs = dynamic(
  () => import("./client.section.tabs").then((m) => m.TeamsSectionTabs),
  { loading: () => <TeamsSectionSkeleton /> },
);
async function TeamsSectionContent({
  params,
  children,
}: {
  params: Promise<{ org: string; teamId: string }>;
  children: ReactNode;
}) {
  const { org, teamId } = await params;
  const { response, org: organization } = await loadTeamOverview(org, teamId);
  if (response.status === "error") throw new Error(response.message);
  if (!response.data || Array.isArray(response.data)) return null;
  return (
    <Tabs organizationName={organization.name} org={org} team={response.data}>
      {children}
    </Tabs>
  );
}

export function TeamsSectionLayout(props: {
  params: Promise<{ org: string; teamId: string }>;
  children: ReactNode;
}) {
  return (
    <Suspense fallback={<TeamsSectionSkeleton />}>
      <TeamsSectionContent {...props} />
    </Suspense>
  );
}
