import { Skeleton } from "../components/ui/skeleton";
import { cn } from "../lib/utils";

export function SettingsPanelSkeleton({
  rows = 3,
  className,
}: {
  rows?: number;
  className?: string;
}) {
  const rowSlots = Array.from({ length: rows }, (_, index) => `row-${index}`);

  return (
    <div
      className={cn("divide-y rounded-md border bg-card", className)}
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="border-b px-4 py-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="mt-2 h-3 w-56 max-w-full" />
      </div>
      {rowSlots.map((slot) => (
        <div
          key={slot}
          className="grid gap-4 px-4 py-4 md:grid-cols-[13.75rem_minmax(0,1fr)] md:gap-4"
        >
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-40 max-w-full" />
          </div>
          <Skeleton className="h-9 w-full max-w-md md:ms-auto" />
        </div>
      ))}
    </div>
  );
}
