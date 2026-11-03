import { isOrganizationsEnabled } from "@loftlancer/env/organizations";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { guardOrganizationSlugPage } from "@/lib/page-guards";
import { routes } from "@/utils/navigation";
import { OrganizationSettingsPageView } from "./client.organization-settings.view";

export const organizationSettingsMetadata: Metadata = {
  title: "Organization settings",
  description: "Organization profile and danger zone.",
};

export async function OrganizationSettingsPage({
  params,
}: {
  params: Promise<{ org: string }>;
}) {
  if (!isOrganizationsEnabled()) redirect(routes.home());
  const { org: slug } = await params;
  await guardOrganizationSlugPage(slug, "settings");
  return <OrganizationSettingsPageView slug={slug} />;
}
