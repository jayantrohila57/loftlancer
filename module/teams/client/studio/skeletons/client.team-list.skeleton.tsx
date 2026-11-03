import { Skeleton } from "@loftlancer/ui/skeleton";

export function TeamsListTableSkeleton() {
  return <Skeleton className="h-64 w-full" />;
}

/** Full route fallback: header + table placeholders. */
export function TeamsListSkeleton() {
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <Skeleton className="h-8 w-24" />
      </div>
      <TeamsListTableSkeleton />
    </div>
  );
}
