import { isOrganizationsEnabled } from "@loftlancer/env/organizations";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OrganizationTeamsPage } from "@/domain/organizations/components/organization-teams-page";
import { OrganizationsFeatureGate } from "@/domain/organizations/components/organizations-feature-gate";
import { guardOrganizationSlugPage } from "@/lib/page-guards";
import { routes } from "@/utils/navigation";

export const metadata: Metadata = {
  title: "Teams",
  description: "Organization teams.",
};

export default async function OrganizationTeamsRoute({
  params,
  searchParams,
}: {
  params: Promise<{ org: string }>;
  searchParams: Promise<{ team?: string }>;
}) {
  if (!isOrganizationsEnabled()) redirect(routes.home());
  const { org: slug } = await params;
  await guardOrganizationSlugPage(slug, "teams");
  const teamId = (await searchParams).team;
  if (teamId) redirect(routes.team(slug, teamId));
  return (
    <OrganizationsFeatureGate>
      <OrganizationTeamsPage slug={slug} />
    </OrganizationsFeatureGate>
  );
}
