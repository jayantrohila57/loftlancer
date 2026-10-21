import { Skeleton } from "../components/ui/skeleton";

export function AccordionSectionSkeleton({ rows = 2 }: { rows?: number }) {
  const rowSlots = ["name", "description", "status", "scope", "actions"].slice(
    0,
    rows,
  );
  return (
    <details
      open
      className="min-w-0 rounded-xl border bg-card"
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <summary className="flex min-h-12 list-none items-center justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-56 max-w-full" />
        </span>
        <Skeleton className="size-4 rounded-sm" />
      </summary>
      <div className="space-y-3 border-t px-4 py-4">
        {rowSlots.map((slot) => (
          <div
            key={slot}
            className="grid gap-2 sm:grid-cols-[minmax(0,13.75rem)_minmax(0,1fr)] sm:items-center sm:gap-6"
          >
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-40 max-w-full" />
            </div>
            <Skeleton className="h-8 w-full max-w-md sm:ms-auto" />
          </div>
        ))}
      </div>
    </details>
  );
}
