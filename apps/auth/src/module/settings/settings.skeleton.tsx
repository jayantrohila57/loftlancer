import { Skeleton } from "@loftlancer/ui/skeleton";

/** Content-only fallback: the settings layout already renders navigation. */
export function AccountSettingsSkeleton() {
  return (
    <div className="min-w-0 space-y-2" role="status" aria-busy="true">
      <span className="sr-only">Loading settings</span>
      <div className="divide-y rounded-md border bg-card" aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => `row-${index}`).map((row) => (
          <div
            key={row}
            className="grid gap-1.5 px-4 py-3 md:grid-cols-[13.75rem_minmax(0,1fr)] md:items-center md:gap-4"
          >
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-40 max-w-full" />
            </div>
            <Skeleton className="h-9 w-full max-w-md md:ms-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
