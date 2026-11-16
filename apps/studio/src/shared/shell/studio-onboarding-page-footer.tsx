import { cn } from "@packages/ui/lib/utils"
import type { ReactNode } from "react"

export function StudioOnboardingPageFooter({
  children,
  className,
}: {
  readonly children: ReactNode
  readonly className?: string
}) {
  return (
    <footer
      className={cn(
        "shrink-0 border-t border-border bg-background px-5 py-4 sm:px-8 lg:px-12",
        className
      )}
    >
      {children}
    </footer>
  )
}
