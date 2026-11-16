import type { WebStatusLevel } from "@/shared/status/web-better-stack-status"
import type { WebStatusServiceGroupId } from "@/shared/status/web-betterstack-monitor-groups.config"

export type WebBetterStackDayStatus =
  | "operational"
  | "degraded"
  | "downtime"
  | "maintenance"
  | "not_monitored"
  | "recovered"
  | "recovered_degraded"

export type WebBetterStackHistoryDay = {
  readonly day: string
  readonly status: WebBetterStackDayStatus
  readonly downtimeDuration: number
  readonly maintenanceDuration: number
}

export type WebBetterStackResourceSnapshot = {
  readonly id: string
  readonly publicName: string
  readonly availability: number | null
  readonly status: string
  readonly statusHistory: readonly WebBetterStackHistoryDay[]
  readonly groupId: WebStatusServiceGroupId
}

export type WebBetterStackStatusReport = {
  readonly id: string
  readonly title: string
  readonly reportType: string
  readonly startsAt: string
  readonly endsAt: string | null
  readonly aggregateState: string
}

export type WebStatusPageSnapshot = {
  readonly source: "api" | "public" | "unknown"
  readonly aggregateState: WebStatusLevel
  readonly updatedAt: string | null
  readonly resources: readonly WebBetterStackResourceSnapshot[]
  readonly activeReports: readonly WebBetterStackStatusReport[]
  readonly historyReports: readonly WebBetterStackStatusReport[]
}
