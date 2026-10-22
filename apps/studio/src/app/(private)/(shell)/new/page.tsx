import { isOrganizationsEnabled } from "@loftlancer/env/organizations";
import { DelayedPageLoading } from "@loftlancer/ui/patterns/delayed-page-loading";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { OrganizationsFeatureGate } from "@/domain/organizations/components/organizations-feature-gate";
import { OrganizationsPageClient } from "@/domain/organizations/components/organizations-page-client";
import { OrganizationsPageSkeleton } from "@/domain/organizations/components/skeletons";
import { PermissionGate } from "@/domain/permissions/components/permission-gate";
import { guardPageAction } from "@/lib/page-guards";
import { siteConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: "New organization",
  description: `Manage workspaces and members in ${siteConfig.name}.`,
};

export default async function NewOrganizationPage() {
  await guardPageAction("organization.list");
  if (!isOrganizationsEnabled()) {
    notFound();
  }

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
          <OrganizationsPageClient createRoute />
        </Suspense>
      </PermissionGate>
    </OrganizationsFeatureGate>
  );
}
