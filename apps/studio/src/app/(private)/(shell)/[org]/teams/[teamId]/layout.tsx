import { HydrationBoundary } from "@tanstack/react-query";
import { guardOrganizationSlugPage } from "@/lib/page-guards";
import { TeamLayoutShell } from "@/module/teams/teams.layout.shell";
import { hydrateTeamOverview } from "@/module/teams/teams.overview.service";

export default async function TeamLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ org: string; teamId: string }>;
}) {
  const { org, teamId } = await params;
  const { session, org: organization } = await guardOrganizationSlugPage(
    org,
    "teams",
  );
  const state = await hydrateTeamOverview(session, organization.id, teamId);
  return (
    <HydrationBoundary state={state}>
      <TeamLayoutShell slug={org} teamId={teamId}>
        {children}
      </TeamLayoutShell>
    </HydrationBoundary>
  );
}
