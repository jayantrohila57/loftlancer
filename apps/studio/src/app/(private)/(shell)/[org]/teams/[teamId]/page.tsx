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
  await params;
  return <TeamOverviewPage />;
}
