import type { WebStatusLevel } from "@/shared/status/web-better-stack-status"
import type {
  WebBetterStackHistoryDay,
  WebBetterStackResourceSnapshot,
  WebStatusPageSnapshot,
} from "@/shared/status/web-betterstack.types"
import type { WebStatusServiceGroupId } from "@/shared/status/web-betterstack-monitor-groups.config"
import {
  WEB_STATUS_MONITOR_GROUP_RULES,
  WEB_STATUS_SERVICE_GROUP_IDS,
} from "@/shared/status/web-betterstack-monitor-groups.config"

export function resolveMonitorGroupId(
  publicName: string
): WebStatusServiceGroupId {
  const normalized = publicName.trim()
  for (const rule of WEB_STATUS_MONITOR_GROUP_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(normalized))) {
      return rule.id
    }
  }
  return "website"
}

export function groupResourcesByService(
  resources: readonly WebBetterStackResourceSnapshot[]
): Map<WebStatusServiceGroupId, WebBetterStackResourceSnapshot[]> {
  const grouped = new Map<
    WebStatusServiceGroupId,
    WebBetterStackResourceSnapshot[]
  >(WEB_STATUS_SERVICE_GROUP_IDS.map((id) => [id, []]))

  for (const resource of resources) {
    const list = grouped.get(resource.groupId)
    if (list) {
      list.push(resource)
    }
  }

  return grouped
}

export function aggregateGroupStatus(
  resources: readonly WebBetterStackResourceSnapshot[]
): WebStatusLevel {
  if (resources.length === 0) {
    return "unknown"
  }

  const levels = resources.map((resource) => mapResourceStatus(resource.status))
  if (levels.includes("outage")) return "outage"
  if (levels.includes("degraded")) return "degraded"
  if (levels.every((level) => level === "operational")) return "operational"
  return "unknown"
}

export function mapResourceStatus(status: string): WebStatusLevel {
  switch (status) {
    case "operational":
    case "recovered":
      return "operational"
    case "degraded":
    case "recovered_degraded":
      return "degraded"
    case "downtime":
      return "outage"
    default:
      return "unknown"
  }
}

export function mapAggregateState(state: string | undefined): WebStatusLevel {
  switch (state) {
    case "operational":
      return "operational"
    case "degraded":
    case "degraded_performance":
      return "degraded"
    case "downtime":
    case "down":
    case "outage":
      return "outage"
    case "maintenance":
      return "degraded"
    default:
      return "unknown"
  }
}

export function worstAggregateLevel(
  snapshot: WebStatusPageSnapshot
): WebStatusLevel {
  if (snapshot.aggregateState !== "unknown") {
    return snapshot.aggregateState
  }
  const resourceLevels = snapshot.resources.map((resource) =>
    mapResourceStatus(resource.status)
  )
  if (resourceLevels.includes("outage")) return "outage"
  if (resourceLevels.includes("degraded")) return "degraded"
  if (resourceLevels.includes("operational")) return "operational"
  return "unknown"
}

export function computeGroupUptimePercent(
  resources: readonly WebBetterStackResourceSnapshot[]
): number | null {
  const values = resources
    .map((resource) => resource.availability)
    .filter((value): value is number => typeof value === "number")
  if (values.length === 0) return null
  const average =
    values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1)
  return Math.round(average * 100_000) / 1000
}

export function mergeHistoryForGroup(
  resources: readonly WebBetterStackResourceSnapshot[]
): WebBetterStackHistoryDay[] {
  if (resources.length === 0) return []

  const dayMap = new Map<string, WebBetterStackHistoryDay>()
  for (const resource of resources) {
    for (const day of resource.statusHistory) {
      const existing = dayMap.get(day.day)
      if (!existing) {
        dayMap.set(day.day, { ...day })
        continue
      }
      const mergedStatus = pickWorseDayStatus(existing.status, day.status)
      dayMap.set(day.day, {
        day: day.day,
        status: mergedStatus,
        downtimeDuration: existing.downtimeDuration + day.downtimeDuration,
        maintenanceDuration:
          existing.maintenanceDuration + day.maintenanceDuration,
      })
    }
  }

  return [...dayMap.values()].sort((left, right) =>
    left.day.localeCompare(right.day)
  )
}

function pickWorseDayStatus(
  left: WebBetterStackHistoryDay["status"],
  right: WebBetterStackHistoryDay["status"]
): WebBetterStackHistoryDay["status"] {
  const rank: Record<WebBetterStackHistoryDay["status"], number> = {
    downtime: 4,
    degraded: 3,
    recovered_degraded: 3,
    maintenance: 2,
    recovered: 1,
    operational: 0,
    not_monitored: -1,
  }
  return rank[left] >= rank[right] ? left : right
}
