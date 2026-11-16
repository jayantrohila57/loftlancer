import { brandLinks } from "@packages/brand"

import { getWebStatusAggregateLevel } from "@/shared/status/web-betterstack.client"

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

export async function getWebPlatformStatus(): Promise<WebPlatformStatus> {
  const href = brandLinks.status
  if (!href) {
    return { href: null, level: "unknown" }
  }

  const level = await getWebStatusAggregateLevel()
  return { href, level }
}
