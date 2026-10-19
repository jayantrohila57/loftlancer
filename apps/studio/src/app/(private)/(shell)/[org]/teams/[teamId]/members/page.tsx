import type { Metadata } from "next";
import { TeamMembersPage } from "@/domain/organizations/components/team-members-page";

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
  return <TeamMembersPage teamId={teamId} />;
}
