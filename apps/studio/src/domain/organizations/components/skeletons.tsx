"use client";

import { DataTable } from "@loftlancer/ui/data-table/data-table";
import { layoutSectionStackClass } from "@loftlancer/ui/layout-spacing";
import { SettingsPanelSkeleton } from "@loftlancer/ui/patterns/settings-panel-skeleton";
import { Skeleton } from "@loftlancer/ui/skeleton";
import { legacyCreateColumnHelper } from "@tanstack/react-table/legacy";
import { ListToolbarSkeleton } from "@/components/layout/list-toolbar-skeleton";
import type { OrgListItem } from "@/components/org/active-organization-context";
import { StatCardRowSkeleton } from "@/components/patterns/stat-card";
import DashboardSection from "@/components/section-dashboard";
import { cn } from "@/lib/utils";
import { OrganizationOverviewSectionsSkeleton } from "./organization-overview-sections";

const columnHelper = legacyCreateColumnHelper<OrgListItem>();
const organizationsTableSkeletonColumns = [
  columnHelper.display({
    id: "name",
    header: "Organization",
    cell: () => null,
  }),
  columnHelper.display({ id: "type", header: "Type", cell: () => null }),
  columnHelper.display({ id: "slug", header: "Slug", cell: () => null }),
  columnHelper.display({ id: "status", header: "Status", cell: () => null }),
  columnHelper.display({ id: "actions", header: "Actions", cell: () => null }),
];

const organizationsPageActionSkeleton = (
  <Skeleton className="size-8 rounded-md sm:h-8 sm:w-auto sm:min-w-[8.5rem]" />
);

export function OrganizationsListBodySkeleton() {
  return (
    <div
      className={cn(layoutSectionStackClass)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <ListToolbarSkeleton />
      <DataTable
        columns={organizationsTableSkeletonColumns}
        data={[]}
        isLoading
        skeletonRowCount={5}
        framed
      />
    </div>
  );
}

export function OrganizationsPageSkeleton() {
  return (
    <DashboardSection
      title="Organizations"
      description="Workspaces you belong to, with members, teams, and access settings."
      back={false}
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
      <StatCardRowSkeleton count={4} compact />
      <OrganizationOverviewSectionsSkeleton />
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

/** @deprecated Use `OrganizationDetailPageSkeleton` or `OrganizationSectionRouteSkeleton`. */
export function OrganizationDetailSkeleton() {
  return <OrganizationDetailPageSkeleton />;
}
