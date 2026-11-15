import Shell from "@packages/ui/components/shell"
import { Skeleton } from "@packages/ui/components/skeleton"

/** Shown while per-request session validation runs (Cache Components / PPR). */
export function AuthAccountSessionFallback() {
  return (
    <Shell.Section variant="dashboard">
      <Skeleton className="h-40 w-full rounded-xl" />
    </Shell.Section>
  )
}
