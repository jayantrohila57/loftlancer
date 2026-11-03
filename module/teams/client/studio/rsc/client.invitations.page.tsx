import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { loadTeamInvitations } from "../../../server/page/server.team-invitations.page";
import { TeamTableSkeleton } from "../skeletons/client.team-table.skeleton";

const TeamInvitationsPage = dynamic(
  () =>
    import(
      "@module/teams/client/studio/components/client.invitations.boundary"
    ).then((m) => m.TeamInvitationsPage),
  { loading: () => <TeamTableSkeleton /> },
);

export const metadata: Metadata = {
  title: "Team invitations",
  description: "Invite people directly into this team.",
};

export default async function TeamInvitationsRoute({
  params,
}: {
  params: Promise<{ org: string; teamId: string }>;
}) {
  const { org, teamId } = await params;
  const initialData = await loadTeamInvitations(org, teamId);
  return (
    <TeamInvitationsPage initialData={initialData} slug={org} teamId={teamId} />
  );
}
