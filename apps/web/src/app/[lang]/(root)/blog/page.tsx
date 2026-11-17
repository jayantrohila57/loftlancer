import type { Metadata } from "next"
import { createWebPageMetadata } from "@/shared/site/web-page-metadata"
import { WebSiteContentPage } from "@/shared/site/web-site-content-page"
import type { LangPageProps } from "@/shared/types/web.app.types"

export async function generateMetadata(
  props: LangPageProps
): Promise<Metadata> {
  return createWebPageMetadata(props, "blogPage")
}

export default async function BlogPage(props: LangPageProps) {
  return WebSiteContentPage({ ...props, namespace: "blogPage" })
}
