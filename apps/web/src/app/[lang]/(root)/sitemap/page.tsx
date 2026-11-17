import type { Metadata } from "next"
import { createWebPageMetadata } from "@/shared/site/web-page-metadata"
import { WebSitemapPage } from "@/shared/sitemap/web-sitemap-page"
import type { LangPageProps } from "@/shared/types/web.app.types"

export async function generateMetadata(
  props: LangPageProps
): Promise<Metadata> {
  return createWebPageMetadata(props, "sitemapPage")
}

export default async function SitemapPage(props: LangPageProps) {
  return WebSitemapPage(props)
}
