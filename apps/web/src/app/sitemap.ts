import { brandLegal } from "@packages/brand"
import type { MetadataRoute } from "next"
import { getWebAbsoluteLocalizedUrls } from "@/shared/site/web-public-sitemap"

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(`${brandLegal.lastUpdatedIso}T00:00:00.000Z`)
  return getWebAbsoluteLocalizedUrls().map((url) => ({
    url,
    lastModified,
    changeFrequency: "weekly",
    priority:
      url.endsWith("/en-us") || url.includes("/en-us/pricing") ? 1 : 0.7,
  }))
}
