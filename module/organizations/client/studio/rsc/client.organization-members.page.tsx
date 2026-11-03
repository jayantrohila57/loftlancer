import { isOrganizationsEnabled } from "@loftlancer/env/organizations";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { guardOrganizationSlugPage } from "@/lib/page-guards";
import { routes } from "@/utils/navigation";
import { OrganizationMembersPageView } from "./client.organization-members.view";

export const organizationMembersMetadata: Metadata = {
  title: "Members",
  description: "Organization members and roles.",
};

export async function OrganizationMembersPage({
  params,
}: {
  params: Promise<{ org: string }>;
}) {
  if (!isOrganizationsEnabled()) redirect(routes.home());
  const { org: slug } = await params;
  await guardOrganizationSlugPage(slug, "members");
  return <OrganizationMembersPageView slug={slug} />;
}
