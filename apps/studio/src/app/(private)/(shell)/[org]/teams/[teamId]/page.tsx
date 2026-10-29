import type { Metadata } from "next";
import { TeamOverviewView } from "@/module/teams/teams.overview.view";

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
  return <TeamOverviewView teamId={teamId} />;
}
