import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { TeamOverviewSkeleton } from "../skeletons/client.team-overview.skeleton";

const TeamMembersPage = dynamic(
  () =>
    import(
      "@module/teams/client/studio/components/client.members.content"
    ).then((m) => m.TeamMembersPage),
  { loading: () => <TeamOverviewSkeleton /> },
);

import { TeamSection } from "@module/teams/client/studio/components/client.section.content";

export const metadata: Metadata = {
  title: "Team members",
  description: "Manage members of this team.",
};

export default async function TeamMembersRoute({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  return (
    <TeamSection
      title="Members"
      description="Add existing organization members here. Members gain access to projects assigned to this team based on each project’s access rules. Use Team invitations for people who have not joined the organization yet."
    >
      <TeamMembersPage teamId={teamId} />
    </TeamSection>
  );
}
