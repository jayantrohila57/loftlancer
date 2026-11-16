import { cn } from "@packages/ui/lib/utils"
import type { WebBetterStackHistoryDay } from "@/shared/status/web-betterstack.types"

const DAY_STATUS_CLASS: Record<WebBetterStackHistoryDay["status"], string> = {
  operational: "bg-success",
  recovered: "bg-success/80",
  degraded: "bg-warning",
  recovered_degraded: "bg-warning/80",
  downtime: "bg-destructive",
  maintenance: "bg-primary/70",
  not_monitored: "bg-muted-foreground/25",
}

type WebStatusDayBarInput = {
  readonly days: readonly WebBetterStackHistoryDay[]
}

export function WebStatusDayBar({ days }: WebStatusDayBarInput) {
  const recent = days.slice(-90)

  return (
    <div className="flex h-10 w-full items-stretch gap-px overflow-hidden rounded-md border border-border bg-muted/30 p-0.5">
      {recent.map((day) => (
        <span
          aria-hidden="true"
          className={cn(
            "min-w-0 flex-1 rounded-[2px]",
            DAY_STATUS_CLASS[day.status] ?? "bg-muted-foreground/25"
          )}
          key={day.day}
          title={day.day}
        />
      ))}
    </div>
  )
}
