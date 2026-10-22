import { isOrganizationsEnabled } from "@loftlancer/env/organizations";
import { DelayedPageLoading } from "@loftlancer/ui/patterns/delayed-page-loading";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import OrganizationDetailPage from "@/domain/organizations/components/organization-detail-page";
import { OrganizationsFeatureGate } from "@/domain/organizations/components/organizations-feature-gate";
import { OrganizationDetailPageSkeleton } from "@/domain/organizations/components/skeletons";
import { PermissionGate } from "@/domain/permissions/components/permission-gate";
import {
  guardOrganizationSlugMembership,
  guardOrganizationSlugPage,
} from "@/lib/page-guards";
import { NOT_FOUND_DOCUMENT_TITLE } from "@/lib/siteConfig";
import { routes } from "@/utils/navigation";

interface OrganizationHubPageProps {
  params: Promise<{ org: string }>;
}

export async function generateMetadata({
  params,
}: OrganizationHubPageProps): Promise<Metadata> {
  const { org: slug } = await params;
  // Never echo the raw slug: real org name, or the shared 404 title (#317).
  const org = await guardOrganizationSlugMembership(slug)
    .then((r) => r.org)
    .catch(() => null);
  if (!org) return { title: { absolute: NOT_FOUND_DOCUMENT_TITLE } };
  return {
    title: org.name,
    description: "Organization overview and administration.",
  };
}

export default async function OrganizationHubPage({
  params,
}: OrganizationHubPageProps) {
  const { org: slug } = await params;
  await guardOrganizationSlugPage(slug);

  if (!isOrganizationsEnabled()) {
    redirect(routes.home());
  }

  return (
    <OrganizationsFeatureGate>
      <PermissionGate
        action="organization.hub.view"
        loadingFallback={<OrganizationDetailPageSkeleton />}
      >
        <Suspense
          fallback={
            <DelayedPageLoading fallback={<OrganizationDetailPageSkeleton />} />
          }
        >
          <OrganizationDetailPage slug={slug} />
        </Suspense>
      </PermissionGate>
    </OrganizationsFeatureGate>
  );
}
