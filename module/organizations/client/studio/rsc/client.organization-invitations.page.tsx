import { isOrganizationsEnabled } from "@loftlancer/env/organizations";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { guardOrganizationSlugPage } from "@/lib/page-guards";
import { routes } from "@/utils/navigation";
import { OrganizationInvitationsPage } from "../components/client.organization-invitations.page";

export const organizationInvitationsMetadata: Metadata = {
  title: "Invitations",
  description: "Pending organization invitations.",
};

export async function OrganizationInvitationsRoute({
  params,
}: {
  params: Promise<{ org: string }>;
}) {
  if (!isOrganizationsEnabled()) redirect(routes.home());
  const { org: slug } = await params;
  await guardOrganizationSlugPage(slug, "invitations");
  return <OrganizationInvitationsPage slug={slug} />;
}
