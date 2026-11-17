import { brandLinks } from "@packages/brand"
import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const site = brandLinks.website.replace(/\/$/, "")
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: `${site}/sitemap.xml`,
    host: site,
  }
}
