import { isOrganizationsEnabled } from "@loftlancer/env/organizations";
import { DelayedPageLoading } from "@loftlancer/ui/patterns/delayed-page-loading";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { guardPageAction } from "@/lib/page-guards";
import { siteConfig } from "@/lib/siteConfig";
import { OrganizationsFeatureGate } from "@/module/organizations/organizations.organizations.feature.gate";
import { OrganizationsPageClient } from "@/module/organizations/organizations.organizations.page.client";
import { OrganizationsPageSkeleton } from "@/module/organizations/organizations.skeletons";
import { PermissionGate } from "@/shared/permissions/shared.permissions.permission.gate";

export const metadata: Metadata = {
  title: "New organization",
  description: `Manage organizations and members in ${siteConfig.name}.`,
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
