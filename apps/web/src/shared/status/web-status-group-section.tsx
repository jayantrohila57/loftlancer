import { cn } from "@packages/ui/lib/utils"
import {
  aggregateGroupStatus,
  computeGroupUptimePercent,
  mergeHistoryForGroup,
} from "@/shared/status/web-betterstack.mapper"
import type { WebBetterStackResourceSnapshot } from "@/shared/status/web-betterstack.types"
import { WebStatusDayBar } from "@/shared/status/web-status-day-bar"

const GROUP_STATUS_LABEL: Record<string, string> = {
  operational: "Operational",
  degraded: "Degraded",
  outage: "Outage",
  unknown: "Unknown",
}

type WebStatusGroupSectionInput = {
  readonly groupLabel: string
  readonly daysLabel: string
  readonly resources: readonly WebBetterStackResourceSnapshot[]
}

export function WebStatusGroupSection({
  groupLabel,
  daysLabel,
  resources,
}: WebStatusGroupSectionInput) {
  if (resources.length === 0) {
    return null
  }

  const level = aggregateGroupStatus(resources)
  const uptime = computeGroupUptimePercent(resources)
  const mergedHistory = mergeHistoryForGroup(resources)

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{groupLabel}</h2>
          <p className="text-sm text-muted-foreground">
            {daysLabel}
            {typeof uptime === "number" ? ` · ${uptime.toFixed(3)}%` : null}
          </p>
        </div>
        <span
          className={cn(
            "text-sm font-medium",
            level === "operational" && "text-success",
            level === "degraded" && "text-warning",
            level === "outage" && "text-destructive",
            level === "unknown" && "text-muted-foreground"
          )}
        >
          {GROUP_STATUS_LABEL[level] ?? "Unknown"}
        </span>
      </header>

      <WebStatusDayBar days={mergedHistory} />

      <ul className="space-y-2">
        {resources.map((resource) => (
          <li
            className="flex items-center justify-between gap-3 text-sm"
            key={resource.id}
          >
            <span className="text-foreground">{resource.publicName}</span>
            <span className="shrink-0 text-muted-foreground">
              {typeof resource.availability === "number"
                ? `${(resource.availability * 100).toFixed(3)}%`
                : "—"}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
