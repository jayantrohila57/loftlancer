import { isOrganizationsEnabled } from "@loftlancer/env/organizations";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OrganizationSettingsPage } from "@/domain/organizations/components/organization-settings-page";
import { OrganizationsFeatureGate } from "@/domain/organizations/components/organizations-feature-gate";
import { guardOrganizationSlugPage } from "@/lib/page-guards";
import { routes } from "@/utils/navigation";

export const metadata: Metadata = {
  title: "Organization settings",
  description: "Organization profile and danger zone.",
};

export default async function OrganizationSettingsRoute({
  params,
}: {
  params: Promise<{ org: string }>;
}) {
  if (!isOrganizationsEnabled()) redirect(routes.home());
  const { org: slug } = await params;
  await guardOrganizationSlugPage(slug, "settings");
  return (
    <OrganizationsFeatureGate>
      <OrganizationSettingsPage slug={slug} />
    </OrganizationsFeatureGate>
  );
}
