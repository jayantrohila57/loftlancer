"use client";

import { Skeleton } from "@loftlancer/ui/skeleton";

export function OrganizationListSkeleton() {
  return (
    <div
      className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4"
      role="status"
      aria-busy="true"
    >
      {[0, 1, 2, 3].map((item) => (
        <div key={item} className="grid gap-3 rounded-xl border p-4">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      ))}
    </div>
  );
}

export function OrganizationOverviewSkeleton() {
  return (
    <div className="min-w-0 space-y-4" role="status" aria-busy="true">
      {[0, 1].map((item) => (
        <div key={item} className="rounded-xl border p-5">
          <Skeleton className="mb-4 h-5 w-48" />
          <Skeleton className="h-16 w-full" />
        </div>
      ))}
    </div>
  );
}

export function OrganizationRouteSkeleton() {
  return (
    <div className="min-w-0 space-y-4" role="status" aria-busy="true">
      <OrganizationOverviewSkeleton />
    </div>
  );
}
