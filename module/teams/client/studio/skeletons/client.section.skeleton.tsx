import { Skeleton } from "@loftlancer/ui/skeleton";
import { TeamOverviewSkeleton } from "./client.team-overview.skeleton";
export function TeamsSectionSkeleton() {
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-full max-w-sm" />
      <Skeleton className="h-10 w-full" />
      <TeamOverviewSkeleton />
    </div>
  );
}
