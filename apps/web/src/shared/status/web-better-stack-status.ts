import { brandLinks } from "@packages/brand"

/** Public Better Stack status-page snapshot, cached for ~60s. */
const REVALIDATE_SECONDS = 60
const USER_AGENT = "LoftlancerStatus/1.0 (+https://loftlancer.com)"

export const WEB_STATUS_LEVELS = [
  "operational",
  "degraded",
  "outage",
  "unknown",
] as const

export type WebStatusLevel = (typeof WEB_STATUS_LEVELS)[number]

export type WebPlatformStatus = {
  readonly href: string | null
  readonly level: WebStatusLevel
}

type StatusPageIndex = {
  readonly data?: {
    readonly attributes?: {
      readonly aggregate_state?: unknown
    }
  }
}

function mapAggregateState(state: string): WebStatusLevel {
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
    default:
      return "unknown"
  }
}

function statusIndexUrl(statusPageUrl: string): URL {
  const base = statusPageUrl.endsWith("/") ? statusPageUrl : `${statusPageUrl}/`
  return new URL("index.json", base)
}

export async function getWebPlatformStatus(): Promise<WebPlatformStatus> {
  const href = brandLinks.status
  if (!href) {
    return { href: null, level: "unknown" }
  }

  try {
    const response = await fetch(statusIndexUrl(href), {
      headers: {
        Accept: "application/json",
        "User-Agent": USER_AGENT,
      },
      next: { revalidate: REVALIDATE_SECONDS },
    })
    if (!response.ok) {
      return { href, level: "unknown" }
    }

    const payload = (await response.json()) as StatusPageIndex
    const aggregateState = payload.data?.attributes?.aggregate_state
    if (typeof aggregateState !== "string") {
      return { href, level: "unknown" }
    }

    return { href, level: mapAggregateState(aggregateState) }
  } catch {
    return { href, level: "unknown" }
  }
}
