import type { Metadata } from "next";
import { TeamOverviewPage } from "@/domain/organizations/components/team-overview-page";

export const metadata: Metadata = {
  title: "Team overview",
  description: "Team members and linked projects.",
};

export default async function OrganizationTeamRoute({
  params,
}: {
  params: Promise<{ org: string; teamId: string }>;
}) {
  const { teamId } = await params;
  return <TeamOverviewPage teamId={teamId} />;
}
