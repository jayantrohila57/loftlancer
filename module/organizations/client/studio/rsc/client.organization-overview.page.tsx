import { isOrganizationsEnabled } from "@loftlancer/t3-env/organizations";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { isPersonalOrganization } from "@/lib/org-personal";
import { guardOrganizationSlugMembership } from "@/lib/page-guards";
import { NOT_FOUND_DOCUMENT_TITLE } from "@/lib/siteConfig";
import { routes } from "@/utils/navigation";
import { loadOrganizationOverview } from "../../../server/page/server.organizations-pages.page";
import { OrganizationOverviewContent } from "../components/client.organization-overview.content";

interface Props {
  params: Promise<{ org: string }>;
}

export async function generateOrganizationOverviewMetadata({
  params,
}: Props): Promise<Metadata> {
  const { org: slug } = await params;
  const org = await guardOrganizationSlugMembership(slug)
    .then((result) => result.org)
    .catch(() => null);
  return org
    ? {
        title: org.name,
        description: "Organization overview and administration.",
      }
    : { title: { absolute: NOT_FOUND_DOCUMENT_TITLE } };
}

export async function OrganizationOverviewPage({ params }: Props) {
  const { org: slug } = await params;
  const { org, response } = await loadOrganizationOverview(slug);
  if (!isOrganizationsEnabled()) redirect(routes.home());
  if (response.status === "failed") notFound();
  return (
    <OrganizationOverviewContent
      slug={slug}
      initialResponse={response}
      personal={isPersonalOrganization({ metadata: org.metadata })}
    />
  );
}
