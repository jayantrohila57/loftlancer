import { groupResourcesByService } from "@/shared/status/web-betterstack.mapper"
import type { WebStatusPageSnapshot } from "@/shared/status/web-betterstack.types"
import { WEB_STATUS_MONITOR_GROUP_RULES } from "@/shared/status/web-betterstack-monitor-groups.config"
import { WebStatusBanner } from "@/shared/status/web-status-banner"
import { WebStatusGroupSection } from "@/shared/status/web-status-group-section"
import { WebStatusUpdatedAt } from "@/shared/status/web-status-timezone.client"
import { WebStatusToolbar } from "@/shared/status/web-status-toolbar.client"

type StatusPageCopy = {
  readonly overviewTab: string
  readonly historyTab: string
  readonly updatedPrefix: string
  readonly daysLabel: string
  readonly noIncidentsTitle: string
  readonly noIncidentsBody: string
  readonly incidentsTitle: string
  readonly incidentStatusAt: (status: string, time: string) => string
  readonly updatedAtEmpty: string
  readonly banner: Record<
    "operational" | "degraded" | "outage" | "unknown",
    { readonly title: string; readonly description: string }
  >
  readonly groups: Record<string, string>
}

type WebStatusPageOverviewInput = {
  readonly snapshot: WebStatusPageSnapshot
  readonly copy: StatusPageCopy
}

export function WebStatusPageOverview({
  snapshot,
  copy,
}: WebStatusPageOverviewInput) {
  const grouped = groupResourcesByService(snapshot.resources)
  const banner = copy.banner[snapshot.aggregateState]

  return (
    <div className="flex w-full flex-col gap-8 self-stretch">
      <WebStatusToolbar
        historyLabel={copy.historyTab}
        overviewLabel={copy.overviewTab}
      />

      <WebStatusUpdatedAt
        emptyLabel={copy.updatedAtEmpty}
        isoDate={snapshot.updatedAt}
        prefix={copy.updatedPrefix}
      />

      <WebStatusBanner
        description={banner.description}
        level={snapshot.aggregateState}
        title={banner.title}
      />

      {snapshot.activeReports.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-base font-medium">{copy.incidentsTitle}</h2>
          <ul className="space-y-2">
            {snapshot.activeReports.map((report) => (
              <li
                className="rounded-md border border-border px-3 py-2 text-sm"
                key={report.id}
              >
                <p className="font-medium">{report.title}</p>
                <p className="text-muted-foreground">
                  {copy.incidentStatusAt(
                    report.aggregateState,
                    report.startsAt
                  )}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="rounded-md border border-border bg-muted/20 px-4 py-3 text-sm">
          <p className="font-medium">{copy.noIncidentsTitle}</p>
          <p className="mt-1 text-muted-foreground">{copy.noIncidentsBody}</p>
        </section>
      )}

      <div className="space-y-10">
        {WEB_STATUS_MONITOR_GROUP_RULES.map((rule) => (
          <WebStatusGroupSection
            daysLabel={copy.daysLabel}
            groupLabel={copy.groups[rule.labelKey] ?? rule.labelKey}
            key={rule.id}
            resources={grouped.get(rule.id) ?? []}
          />
        ))}
      </div>
    </div>
  )
}
