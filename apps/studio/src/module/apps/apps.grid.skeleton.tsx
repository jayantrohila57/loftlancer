import { Skeleton } from "@loftlancer/ui/skeleton";

const SKELETON_KEYS = ["a", "b", "c", "d", "e", "f"];

export function AppGridSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div
      className="grid gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3"
      role="status"
      aria-busy="true"
    >
      {SKELETON_KEYS.slice(0, count).map((k) => (
        <Skeleton key={k} className="min-h-36 rounded-md" />
      ))}
    </div>
  );
}
