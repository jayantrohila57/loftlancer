import type { Metadata } from "next";
import { TeamInvitationsPage } from "@/domain/organizations/components/team-invitations-page";

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
