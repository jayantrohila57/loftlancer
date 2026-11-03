import { isOrganizationsEnabled } from "@loftlancer/t3-env/organizations";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { guardOrganizationSlugPage } from "@/lib/page-guards";
import { routes } from "@/utils/navigation";
import { OrganizationRolesPageView } from "./client.organization-roles.view";

export const organizationRolesMetadata: Metadata = {
  title: "Roles & access",
  description: "Organization roles and permissions.",
};

export async function OrganizationRolesPage({
  params,
}: {
  params: Promise<{ org: string }>;
}) {
  if (!isOrganizationsEnabled()) redirect(routes.home());
  const { org: slug } = await params;
  await guardOrganizationSlugPage(slug, "roles");
  return <OrganizationRolesPageView slug={slug} />;
}
