"use client";

import { Skeleton } from "@loftlancer/ui/skeleton";
import { InstalledAppsOverview } from "@/domain/apps/components/installed-apps-overview";

export function ProjectOverviewSectionsSkeleton() {
  return (
    <div className="flex flex-col gap-3" role="status" aria-busy="true">
      <Skeleton className="h-4 w-10" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-28 rounded-xl" />
      </div>
    </div>
  );
}

export function ProjectOverviewSections({ slug }: { slug: string }) {
  return (
    <div className="flex flex-col gap-6">
      <InstalledAppsOverview slug={slug} />
    </div>
  );
}
