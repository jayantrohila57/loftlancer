import { serverEnv } from "@/shared/config/web.server-env"
import type { WebStatusLevel } from "@/shared/status/web-better-stack-status"
import {
  mapAggregateState,
  resolveMonitorGroupId,
} from "@/shared/status/web-betterstack.mapper"
import type {
  WebBetterStackHistoryDay,
  WebBetterStackResourceSnapshot,
  WebBetterStackStatusReport,
  WebStatusPageSnapshot,
} from "@/shared/status/web-betterstack.types"
import {
  WEB_BETTERSTACK_DEFAULT_STATUS_PAGE_ID,
  WEB_BETTERSTACK_PUBLIC_STATUS_ORIGIN,
} from "@/shared/status/web-betterstack-monitor-groups.config"

export const WEB_BETTERSTACK_REVALIDATE_SECONDS = 60

const UPTIME_API_ORIGIN = "https://incidents.betterstack.com/api/v2"
const USER_AGENT = "LoftlancerStatus/1.0 (+https://loftlancer.com/status)"

type JsonApiResource = {
  readonly id?: string
  readonly type?: string
  readonly attributes?: Record<string, unknown>
}

type JsonApiList = {
  readonly data?: readonly JsonApiResource[]
}

type JsonApiDocument = {
  readonly data?: JsonApiResource
  readonly included?: readonly JsonApiResource[]
}

function statusPageId(): string {
  return (
    serverEnv.BETTERSTACK_STATUS_PAGE_ID ??
    WEB_BETTERSTACK_DEFAULT_STATUS_PAGE_ID
  )
}

function publicIndexUrl(): URL {
  return new URL("index.json", `${WEB_BETTERSTACK_PUBLIC_STATUS_ORIGIN}/`)
}

function parseHistoryDay(
  entry: Record<string, unknown>
): WebBetterStackHistoryDay | null {
  const day = entry.day
  const status = entry.status
  if (typeof day !== "string" || typeof status !== "string") {
    return null
  }
  return {
    day,
    status: status as WebBetterStackHistoryDay["status"],
    downtimeDuration:
      typeof entry.downtime_duration === "number" ? entry.downtime_duration : 0,
    maintenanceDuration:
      typeof entry.maintenance_duration === "number"
        ? entry.maintenance_duration
        : 0,
  }
}

function parseResource(
  resource: JsonApiResource
): WebBetterStackResourceSnapshot | null {
  const attributes = resource.attributes
  if (!attributes) return null
  const publicName =
    typeof attributes.public_name === "string"
      ? attributes.public_name
      : resource.id
  if (!publicName || !resource.id) return null

  const historyRaw = attributes.status_history
  const statusHistory: WebBetterStackHistoryDay[] = []
  if (Array.isArray(historyRaw)) {
    for (const entry of historyRaw) {
      if (entry && typeof entry === "object") {
        const parsed = parseHistoryDay(entry as Record<string, unknown>)
        if (parsed) statusHistory.push(parsed)
      }
    }
  }

  const availability =
    typeof attributes.availability === "number" ? attributes.availability : null
  const status =
    typeof attributes.status === "string" ? attributes.status : "unknown"

  return {
    id: resource.id,
    publicName,
    availability,
    status,
    statusHistory,
    groupId: resolveMonitorGroupId(publicName),
  }
}

function parseReport(
  resource: JsonApiResource
): WebBetterStackStatusReport | null {
  const attributes = resource.attributes
  if (!attributes || !resource.id) return null
  const title =
    typeof attributes.title === "string" ? attributes.title : "Incident"
  return {
    id: resource.id,
    title,
    reportType:
      typeof attributes.report_type === "string"
        ? attributes.report_type
        : "manual",
    startsAt:
      typeof attributes.starts_at === "string" ? attributes.starts_at : "",
    endsAt: typeof attributes.ends_at === "string" ? attributes.ends_at : null,
    aggregateState:
      typeof attributes.aggregate_state === "string"
        ? attributes.aggregate_state
        : "unknown",
  }
}

function unknownSnapshot(): WebStatusPageSnapshot {
  return {
    source: "unknown",
    aggregateState: "unknown",
    updatedAt: null,
    resources: [],
    activeReports: [],
    historyReports: [],
  }
}

async function fetchBetterStackJson<T>(
  input: RequestInfo,
  init?: RequestInit
): Promise<T | null> {
  try {
    const response = await fetch(input, {
      ...init,
      headers: {
        Accept: "application/json",
        "User-Agent": USER_AGENT,
        ...init?.headers,
      },
      next: { revalidate: WEB_BETTERSTACK_REVALIDATE_SECONDS },
    })
    if (!response.ok) return null
    return (await response.json()) as T
  } catch {
    return null
  }
}

async function fetchPublicSnapshot(): Promise<WebStatusPageSnapshot | null> {
  const payload = await fetchBetterStackJson<JsonApiDocument>(
    publicIndexUrl().toString()
  )
  if (!payload) return null

  const aggregateRaw = payload.data?.attributes?.aggregate_state
  const aggregateState = mapAggregateState(
    typeof aggregateRaw === "string" ? aggregateRaw : undefined
  )
  const updatedAt =
    typeof payload.data?.attributes?.updated_at === "string"
      ? payload.data.attributes.updated_at
      : null

  const included = payload.included ?? []
  const resources = included
    .filter((item) => item.type === "status_page_resource")
    .map((item) => parseResource(item))
    .filter((item): item is WebBetterStackResourceSnapshot => item !== null)

  return {
    source: "public",
    aggregateState,
    updatedAt,
    resources,
    activeReports: [],
    historyReports: [],
  }
}

async function fetchAuthorizedSnapshot(
  token: string
): Promise<WebStatusPageSnapshot | null> {
  const pageId = statusPageId()
  const headers = { Authorization: `Bearer ${token}` }

  const [pagePayload, resourcesPayload, reportsPayload] = await Promise.all([
    fetchBetterStackJson<JsonApiDocument>(
      `${UPTIME_API_ORIGIN}/status-pages/${pageId}`,
      { headers }
    ),
    fetchBetterStackJson<JsonApiList>(
      `${UPTIME_API_ORIGIN}/status-pages/${pageId}/resources?per_page=250`,
      { headers }
    ),
    fetchBetterStackJson<JsonApiList>(
      `${UPTIME_API_ORIGIN}/status-pages/${pageId}/status-reports?per_page=250`,
      { headers }
    ),
  ])

  if (!pagePayload && !resourcesPayload) {
    return null
  }

  const aggregateRaw = pagePayload?.data?.attributes?.aggregate_state
  const aggregateState = mapAggregateState(
    typeof aggregateRaw === "string" ? aggregateRaw : undefined
  )
  const updatedAt =
    typeof pagePayload?.data?.attributes?.updated_at === "string"
      ? pagePayload.data.attributes.updated_at
      : null

  const resources = (resourcesPayload?.data ?? [])
    .map((item) => parseResource(item))
    .filter((item): item is WebBetterStackResourceSnapshot => item !== null)

  const reports = (reportsPayload?.data ?? [])
    .map((item) => parseReport(item))
    .filter((item): item is WebBetterStackStatusReport => item !== null)

  const activeReports = reports.filter((report) => {
    const state = report.aggregateState
    return (
      state === "downtime" || state === "degraded" || state === "maintenance"
    )
  })

  const historyReports = reports.filter(
    (report) => !activeReports.includes(report)
  )

  return {
    source: "api",
    aggregateState,
    updatedAt,
    resources,
    activeReports,
    historyReports,
  }
}

export async function getWebStatusPageSnapshot(): Promise<WebStatusPageSnapshot> {
  const token = serverEnv.BETTERSTACK_API_TOKEN

  if (token) {
    const authorized = await fetchAuthorizedSnapshot(token)
    if (authorized) return authorized
  }

  const fallback = await fetchPublicSnapshot()
  if (fallback) return fallback

  return unknownSnapshot()
}

export async function getWebStatusAggregateLevel(): Promise<WebStatusLevel> {
  const snapshot = await getWebStatusPageSnapshot()
  if (snapshot.aggregateState !== "unknown") {
    return snapshot.aggregateState
  }

  const resourceStates = snapshot.resources.map((resource) => resource.status)
  if (resourceStates.some((status) => status === "downtime")) return "outage"
  if (resourceStates.some((status) => status === "degraded")) return "degraded"
  if (resourceStates.some((status) => status === "operational")) {
    return "operational"
  }

  return "unknown"
}
