import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { TeamOverviewSkeleton } from "../skeletons/client.team-overview.skeleton";

const TeamProjectsPage = dynamic(
  () =>
    import(
      "@module/teams/client/studio/components/client.projects.content"
    ).then((m) => m.TeamProjectsPage),
  { loading: () => <TeamOverviewSkeleton /> },
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
  return (
    <TeamSection
      title="Projects with access"
      description="A person gets project access through any team that has access to the project. Individual access settings apply only while at least one team has access."
    >
      <TeamProjectsPage slug={org} teamId={teamId} />
    </TeamSection>
  );
}
