import { isOrganizationsEnabled } from "@loftlancer/env/organizations";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OrganizationsFeatureGate } from "@/domain/organizations/components/organizations-feature-gate";
import { guardOrganizationSlugPage } from "@/lib/page-guards";
import { OrganizationRolesPageView } from "@/module/organizations/organizations.roles.view";
import { routes } from "@/utils/navigation";

export const metadata: Metadata = {
  title: "Roles & access",
  description: "Organization roles and permissions.",
};

export default async function OrganizationRolesRoute({
  params,
}: {
  params: Promise<{ org: string }>;
}) {
  if (!isOrganizationsEnabled()) redirect(routes.home());
  const { org: slug } = await params;
  await guardOrganizationSlugPage(slug, "roles");
  return (
    <OrganizationsFeatureGate>
      <OrganizationRolesPageView slug={slug} />
    </OrganizationsFeatureGate>
  );
}
