"use client"

import { useFormatter, useTranslations } from "next-intl"
import { useMemo } from "react"
import type { WebBetterStackStatusReport } from "@/shared/status/web-betterstack.types"
import {
  useStatusTimezone,
  WebStatusUpdatedAt,
} from "@/shared/status/web-status-timezone.client"
import { WebStatusToolbar } from "@/shared/status/web-status-toolbar.client"

type WebStatusPageHistoryInput = {
  readonly reports: readonly WebBetterStackStatusReport[]
  readonly updatedAt: string | null
}

export function WebStatusPageHistory({
  reports,
  updatedAt,
}: WebStatusPageHistoryInput) {
  const t = useTranslations("statusPage")
  const timezone = useStatusTimezone()
  const format = useFormatter()

  const groups = useMemo(
    () => groupReportsByMonth(reports, timezone, format),
    [reports, timezone, format]
  )

  return (
    <div className="flex w-full flex-col gap-8 self-stretch">
      <WebStatusToolbar
        historyLabel={t("historyTab")}
        overviewLabel={t("overviewTab")}
      />

      <WebStatusUpdatedAt
        emptyLabel={t("updatedAtEmpty")}
        isoDate={updatedAt}
        prefix={t("updatedPrefix")}
      />

      {groups.length === 0 ? (
        <section className="rounded-md border border-border bg-muted/20 px-4 py-3 text-sm">
          <p className="font-medium">{t("historyEmptyTitle")}</p>
          <p className="mt-1 text-muted-foreground">{t("historyEmptyBody")}</p>
        </section>
      ) : (
        <div className="space-y-8">
          {groups.map((group) => (
            <section className="space-y-3" key={group.monthKey}>
              <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                {group.monthLabel}
              </h2>
              <ul className="space-y-2">
                {group.items.map((report) => (
                  <li
                    className="rounded-md border border-border px-3 py-2 text-sm"
                    key={report.id}
                  >
                    <p className="font-medium">{report.title}</p>
                    <p className="text-muted-foreground">
                      {formatRange(
                        report,
                        timezone,
                        format,
                        (status, start, end) =>
                          t("historyIncidentRange", {
                            status,
                            start,
                            end: end || t("historyOngoing"),
                          })
                      )}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

type StatusFormat = ReturnType<typeof useFormatter>

function groupReportsByMonth(
  reports: readonly WebBetterStackStatusReport[],
  timezone: string,
  format: StatusFormat
) {
  const sorted = [...reports].sort((left, right) =>
    right.startsAt.localeCompare(left.startsAt)
  )

  const monthMap = new Map<
    string,
    {
      monthKey: string
      monthLabel: string
      items: WebBetterStackStatusReport[]
    }
  >()

  for (const report of sorted) {
    if (!report.startsAt) continue
    const date = new Date(report.startsAt)
    const monthKey = format.dateTime(date, {
      year: "numeric",
      month: "2-digit",
      timeZone: timezone,
    })
    const monthLabel = format.dateTime(date, {
      month: "long",
      year: "numeric",
      timeZone: timezone,
    })

    const existing = monthMap.get(monthKey)
    if (existing) {
      existing.items.push(report)
    } else {
      monthMap.set(monthKey, { monthKey, monthLabel, items: [report] })
    }
  }

  return [...monthMap.values()]
}

function formatRange(
  report: WebBetterStackStatusReport,
  timezone: string,
  format: StatusFormat,
  formatIncidentRange: (status: string, start: string, end: string) => string
): string {
  const start = report.startsAt
    ? format.dateTime(new Date(report.startsAt), {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: timezone,
      })
    : ""
  const end = report.endsAt
    ? format.dateTime(new Date(report.endsAt), {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: timezone,
      })
    : ""
  return formatIncidentRange(report.aggregateState, start, end)
}
