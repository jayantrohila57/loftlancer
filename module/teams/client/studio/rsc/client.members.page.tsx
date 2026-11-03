import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { loadTeamMembers } from "../../../server/page/server.team-members.page";
import { TeamTableSkeleton } from "../skeletons/client.team-table.skeleton";

const TeamMembersPage = dynamic(
  () =>
    import(
      "@module/teams/client/studio/components/client.members.boundary"
    ).then((m) => m.TeamMembersPage),
  { loading: () => <TeamTableSkeleton /> },
);

import { TeamSection } from "@module/teams/client/studio/components/client.section.content";

export const metadata: Metadata = {
  title: "Team members",
  description: "Manage members of this team.",
};

export default async function TeamMembersRoute({
  params,
}: {
  params: Promise<{ org: string; teamId: string }>;
}) {
  const { org, teamId } = await params;
  const initialData = await loadTeamMembers(org, teamId);
  return (
    <TeamSection
      title="Members"
      description="Add existing organization members here. Members gain access to projects assigned to this team based on each project’s access rules. Use Team invitations for people who have not joined the organization yet."
    >
      <TeamMembersPage initialData={initialData} teamId={teamId} />
    </TeamSection>
  );
}
