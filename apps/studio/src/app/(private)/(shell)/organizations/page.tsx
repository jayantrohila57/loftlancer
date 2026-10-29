import { isOrganizationsEnabled } from "@loftlancer/env/organizations";
import { DelayedPageLoading } from "@loftlancer/ui/patterns/delayed-page-loading";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { PermissionGate } from "@/domain/permissions/components/permission-gate";
import {
  guardAuthenticatedPage,
  guardOrganizationSlugMembership,
  guardOrganizationSlugPage,
  guardPageAction,
} from "@/lib/page-guards";
import { siteConfig } from "@/lib/siteConfig";
import { OrganizationsFeatureGate } from "@/module/organizations/organizations.organizations.feature.gate";
import { OrganizationsPageClient } from "@/module/organizations/organizations.organizations.page.client";
import { OrganizationsPageSkeleton } from "@/module/organizations/organizations.skeletons";
import { routes } from "@/utils/navigation";

export const metadata: Metadata = {
  title: "Organizations",
  description: `Manage organizations and members in ${siteConfig.name}.`,
};

export default async function OrganizationsDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ directory?: string }>;
}) {
  await guardAuthenticatedPage();
  if (!isOrganizationsEnabled()) notFound();

  const { directory } = await searchParams;
  if (directory !== "1") {
    const legacyOrganization = await guardOrganizationSlugMembership(
      "organizations",
    ).catch(() => null);
    if (legacyOrganization) {
      await guardOrganizationSlugPage("organizations");
      redirect(routes.projects("organizations"));
    }
  }

  await guardPageAction("organization.list");
  return (
    <OrganizationsFeatureGate>
      <PermissionGate
        action="organization.list"
        loadingFallback={<OrganizationsPageSkeleton />}
      >
        <Suspense
          fallback={
            <DelayedPageLoading fallback={<OrganizationsPageSkeleton />} />
          }
        >
          <OrganizationsPageClient />
        </Suspense>
      </PermissionGate>
    </OrganizationsFeatureGate>
  );
}
