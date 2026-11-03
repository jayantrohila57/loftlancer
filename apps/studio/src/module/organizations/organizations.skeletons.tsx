"use client";

import { SettingsPanelSkeleton } from "@features/patterns/core/client/patterns.settings-panel-skeleton";
import { Skeleton } from "@loftlancer/ui/skeleton";
import { OrganizationSectionPage } from "@module/organizations/client/studio/components/client.organization-section.page";
import { OrganizationSettingsContentSkeleton } from "@module/organizations/client/studio/skeletons/client.organization-settings-content.skeleton";
import { OrganizationOverviewSkeleton } from "@module/organizations/client/studio/skeletons/client.organization-skeleton";
import DashboardSection from "@/components/section-dashboard";

export { OrganizationSettingsContentSkeleton } from "@module/organizations/client/studio/skeletons/client.organization-settings-content.skeleton";

const organizationsPageActionSkeleton = (
  <Skeleton className="size-8 rounded-md sm:h-8 sm:w-auto sm:min-w-[8.5rem]" />
);

export function OrganizationsListBodySkeleton() {
  return (
    <div
      className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {[0, 1, 2, 3].map((item) => (
        <div key={item} className="min-w-0 rounded-xl border p-4">
          <div className="flex items-start gap-3">
            <Skeleton className="size-9 shrink-0 rounded-full" />
            <div className="grid min-w-0 flex-1 gap-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
          <div className="mt-8 flex justify-end">
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function OrganizationsPageSkeleton() {
  return (
    <DashboardSection
      title="Organizations"
      description="Organizations you belong to, with members, teams, and access settings."
      back={false}
      actionPlacement="header"
      descriptionGapClassName="gap-y-1"
      tabsViewportClassName="py-1"
      action={organizationsPageActionSkeleton}
    >
      <OrganizationsListBodySkeleton />
    </DashboardSection>
  );
}

/** @deprecated Use `OrganizationsPageSkeleton` or `OrganizationsListBodySkeleton`. */
export function OrganizationsListSkeleton() {
  return <OrganizationsListBodySkeleton />;
}

export function OrganizationDetailPageSkeleton() {
  return (
    <div className="min-w-0 space-y-4" role="status" aria-busy="true">
      <OrganizationOverviewSkeleton />
    </div>
  );
}

/** Generic shell for org sub-routes (members, settings, …) during route transitions. */
export function OrganizationSectionRouteSkeleton() {
  return (
    <div className="min-w-0 space-y-4" role="status" aria-busy="true">
      <SettingsPanelSkeleton rows={4} />
    </div>
  );
}

/** Route fallback with the same section heading and accordion footprint. */
export function OrganizationSettingsPageSkeleton({ slug }: { slug: string }) {
  return (
    <OrganizationSectionPage
      slug={slug}
      title="Organization settings"
      description="Organization identity, profile, and lifecycle."
    >
      <OrganizationSettingsContentSkeleton />
    </OrganizationSectionPage>
  );
}

/** @deprecated Use `OrganizationDetailPageSkeleton` or `OrganizationSectionRouteSkeleton`. */
export function OrganizationDetailSkeleton() {
  return <OrganizationDetailPageSkeleton />;
}
