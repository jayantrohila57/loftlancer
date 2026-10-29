import { isOrganizationsEnabled } from "@loftlancer/env/organizations";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OrganizationsFeatureGate } from "@/domain/organizations/components/organizations-feature-gate";
import { guardOrganizationSlugPage } from "@/lib/page-guards";
import { OrganizationMembersPageView } from "@/module/organizations/organizations.members.view";
import { routes } from "@/utils/navigation";

export const metadata: Metadata = {
  title: "Members",
  description: "Organization members and roles.",
};

export default async function OrganizationMembersRoute({
  params,
}: {
  params: Promise<{ org: string }>;
}) {
  if (!isOrganizationsEnabled()) redirect(routes.home());
  const { org: slug } = await params;
  await guardOrganizationSlugPage(slug, "members");
  return (
    <OrganizationsFeatureGate>
      <OrganizationMembersPageView slug={slug} />
    </OrganizationsFeatureGate>
  );
}
