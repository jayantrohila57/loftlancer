import { layoutGapClass } from "@features/shell/utils/shell.layout-spacing.utils";
import { Skeleton } from "@loftlancer/ui/skeleton";
import { cn } from "@/lib/utils";

/** Matches `DataTableToolbar` chrome (search, filters, trailing controls). */
export function ListToolbarSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
      aria-hidden
    >
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-wrap items-center",
          layoutGapClass,
        )}
      >
        <Skeleton className="h-8 w-full min-w-0 sm:max-w-xs" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-28" />
      </div>
      <div className={cn("flex shrink-0 items-center", layoutGapClass)}>
        <Skeleton className="h-8 w-[4.5rem]" />
      </div>
    </div>
  );
}
