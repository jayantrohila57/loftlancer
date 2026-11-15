import type { ReactNode } from "react"

/** Mirrors `FormKit.Section` grid without importing client FormKit. */
export function AppearanceFormSectionSkeleton({
  children,
  description,
  title,
}: {
  readonly children: ReactNode
  readonly description: string
  readonly title: string
}) {
  return (
    <section className="grid w-full grid-cols-6 gap-4 border-b pb-6 last:border-b-0 last:pb-0">
      <div className="col-span-2 w-full space-y-1">
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="col-span-4 w-full min-w-0 self-start overflow-x-clip text-left">
        {children}
      </div>
    </section>
  )
}
