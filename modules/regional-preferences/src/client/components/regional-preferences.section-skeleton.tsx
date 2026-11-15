import { Skeleton } from "@packages/ui/components/skeleton"
import type { ReactNode } from "react"

/** Mirrors `FormKit.Section` grid without importing client FormKit. */
export function RegionalFormSectionSkeleton({
  children,
  description,
  title,
}: {
  readonly children: ReactNode
  readonly description?: string
  readonly title?: string
}) {
  return (
    <section className="grid w-full grid-cols-6 gap-4 border-b pb-6 last:border-b-0 last:pb-0">
      <div className="col-span-2 w-full space-y-1">
        {title ? (
          <h2 className="text-base font-semibold">{title}</h2>
        ) : (
          <Skeleton className="h-5 w-36" />
        )}
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : title ? null : (
          <Skeleton className="h-4 w-full max-w-xs" />
        )}
      </div>
      <div className="col-span-4 w-full">{children}</div>
    </section>
  )
}
