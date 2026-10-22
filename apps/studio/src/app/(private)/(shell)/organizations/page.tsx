import { isOrganizationsEnabled } from "@loftlancer/env/organizations";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import OrganizationDetailPage from "@/domain/organizations/components/organization-detail-page";
import { OrganizationLayoutShell } from "@/domain/organizations/components/organization-layout-shell";
import { OrganizationsFeatureGate } from "@/domain/organizations/components/organizations-feature-gate";
import { OrganizationsPageClient } from "@/domain/organizations/components/organizations-page-client";
import {
  OrganizationDetailPageSkeleton,
  OrganizationsPageSkeleton,
} from "@/domain/organizations/components/skeletons";
import { PermissionGate } from "@/domain/permissions/components/permission-gate";
import {
  guardAuthenticatedPage,
  guardOrganizationSlugMembership,
  guardOrganizationSlugPage,
  guardPageAction,
} from "@/lib/page-guards";
import { siteConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: "Organizations",
  description: `Manage workspaces and members in ${siteConfig.name}.`,
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
      return (
        <OrganizationsFeatureGate>
          <OrganizationLayoutShell
            slug="organizations"
            initialOrganization={legacyOrganization.org}
          >
            <Suspense fallback={<OrganizationDetailPageSkeleton />}>
              <OrganizationDetailPage slug="organizations" />
            </Suspense>
          </OrganizationLayoutShell>
        </OrganizationsFeatureGate>
      );
    }
  }

  await guardPageAction("organization.list");
  return (
    <OrganizationsFeatureGate>
      <PermissionGate action="organization.list">
        <Suspense fallback={<OrganizationsPageSkeleton />}>
          <OrganizationsPageClient />
        </Suspense>
      </PermissionGate>
    </OrganizationsFeatureGate>
  );
}
