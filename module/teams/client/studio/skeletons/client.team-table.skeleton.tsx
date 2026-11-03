import { Skeleton } from "@loftlancer/ui/skeleton";
/** Matches the toolbar and table used by members, projects, and invitations. */
export function TeamTableSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading team details">
      <div className="flex gap-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="overflow-hidden rounded-xl border">
        <Skeleton className="h-10 w-full rounded-none" />
        {["one", "two", "three", "four", "five"].map((row) => (
          <div key={row} className="flex gap-4 border-t p-4">
            <Skeleton className="h-5 w-2/5" />
            <Skeleton className="h-5 w-1/5" />
            <Skeleton className="ml-auto h-5 w-8" />
          </div>
        ))}
      </div>
    </div>
  );
}
