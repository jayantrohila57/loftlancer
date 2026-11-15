import Shell from "@packages/ui/components/shell"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

export interface ShellSubHeaderProps {
  /** Buttons or other controls aligned to the right of the title block. */
  readonly action?: ReactNode
  /** Extra content under the title row, such as section tabs. */
  readonly children?: ReactNode
  readonly description: string
  readonly icon: LucideIcon
  readonly title: string
}

export function ShellSubHeader({
  action,
  children,
  description,
  icon: Icon,
  title,
}: ShellSubHeaderProps) {
  return (
    <Shell.SubHeader>
      <div className="flex items-center gap-4 px-4 py-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
          <Icon className="size-5" strokeWidth={1.75} />
        </div>
        <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-base leading-tight font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      </div>
      {children}
    </Shell.SubHeader>
  )
}
