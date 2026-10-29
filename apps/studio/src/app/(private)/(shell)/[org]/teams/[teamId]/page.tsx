import { HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { guardOrganizationSlugPage } from "@/lib/page-guards";
import { hydrateTeamOverview } from "@/module/teams/teams.overview.service";
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
  const { org: slug, teamId } = await params;
  const { session, org } = await guardOrganizationSlugPage(slug, "teams");
  const state = await hydrateTeamOverview(session, org.id, teamId);
  return (
    <HydrationBoundary state={state}>
      <TeamOverviewView teamId={teamId} />
    </HydrationBoundary>
  );
}
