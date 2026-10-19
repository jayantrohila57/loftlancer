import { isOrganizationsEnabled } from "@loftlancer/env/organizations";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OrganizationTeamsPage } from "@/domain/organizations/components/organization-teams-page";
import { OrganizationsFeatureGate } from "@/domain/organizations/components/organizations-feature-gate";
import { guardOrganizationSlugPage } from "@/lib/page-guards";
import { routes } from "@/utils/navigation";

export const metadata: Metadata = {
  title: "Team members",
  description: "View and manage members of an organization team.",
};

export default async function OrganizationTeamRoute({
  params,
}: {
  params: Promise<{ org: string; teamId: string }>;
}) {
  if (!isOrganizationsEnabled()) redirect(routes.home());
  const { org: slug, teamId } = await params;
  await guardOrganizationSlugPage(slug, "teams");
  return (
    <OrganizationsFeatureGate>
      <OrganizationTeamsPage slug={slug} selectedTeamId={teamId} />
    </OrganizationsFeatureGate>
  );
}
