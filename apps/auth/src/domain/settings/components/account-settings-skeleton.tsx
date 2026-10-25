import { Skeleton } from "@loftlancer/ui/skeleton";

export function AccountSettingsSkeleton() {
  return (
    <div className="min-w-0 space-y-2" role="status" aria-busy="true">
      <div className="flex flex-col gap-2 md:flex-row">
        <div className="hidden min-w-[10.5rem] max-w-[12.5rem] shrink-0 flex-col gap-2 md:flex">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
        <Skeleton className="h-9 w-full max-w-xl md:hidden" />
      </div>
      <div className="rounded-md border bg-card">
        <div className="space-y-3 border-b px-4 py-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-48" />
        </div>
        <div className="space-y-4 px-4 py-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-8 w-28" />
        </div>
      </div>
    </div>
  );
}
