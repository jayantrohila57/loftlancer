import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { TeamOverviewSkeleton } from "../skeletons/client.team-overview.skeleton";

const TeamInvitationsPage = dynamic(
  () =>
    import(
      "@module/teams/client/studio/components/client.invitations.content"
    ).then((m) => m.TeamInvitationsPage),
  { loading: () => <TeamOverviewSkeleton /> },
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
  return <TeamInvitationsPage slug={org} teamId={teamId} />;
}
