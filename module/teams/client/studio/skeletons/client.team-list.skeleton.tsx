import { Skeleton } from "@loftlancer/ui/skeleton";
export function TeamsListSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
