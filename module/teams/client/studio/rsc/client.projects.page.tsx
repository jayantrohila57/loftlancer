import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { loadTeamProjects } from "../../../server/page/server.team-projects.page";
import { TeamTableSkeleton } from "../skeletons/client.team-table.skeleton";

const TeamProjectsPage = dynamic(
  () =>
    import(
      "@module/teams/client/studio/components/client.projects.boundary"
    ).then((m) => m.TeamProjectsPage),
  { loading: () => <TeamTableSkeleton /> },
);

import { TeamSection } from "@module/teams/client/studio/components/client.section.content";

export const metadata: Metadata = {
  title: "Team projects",
  description: "Link this team to projects in its organization.",
};

export default async function TeamProjectsRoute({
  params,
}: {
  params: Promise<{ org: string; teamId: string }>;
}) {
  const { org, teamId } = await params;
  const initialData = await loadTeamProjects(org, teamId);
  return (
    <TeamSection
      title="Projects with access"
      description="A person gets project access through any team that has access to the project. Individual access settings apply only while at least one team has access."
    >
      <TeamProjectsPage initialData={initialData} slug={org} teamId={teamId} />
    </TeamSection>
  );
}
