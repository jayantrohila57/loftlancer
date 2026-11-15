import { cn } from "@packages/ui/lib/utils"
import type { ReactNode } from "react"

export function AppearanceSettingPanel({
  children,
  className,
}: {
  readonly children: ReactNode
  readonly className?: string
}) {
  return (
    <div
      className={cn(
        "w-full rounded-xl border border-border bg-muted/25 p-4 shadow-xs/5",
        className
      )}
    >
      {children}
    </div>
  )
}
