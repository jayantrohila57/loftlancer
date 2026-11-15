import Shell from "@packages/ui/components/shell"
import { Skeleton } from "@packages/ui/components/skeleton"

export function ShellAccountLoading() {
  return (
    <Shell.Section variant="dashboard">
      <div aria-hidden="true" className="space-y-3 rounded-xl border p-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-60 max-w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    </Shell.Section>
  )
}
