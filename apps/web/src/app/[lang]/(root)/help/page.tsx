import type { Metadata } from "next"
import { WebHelpCenterPage } from "@/shared/help/web-help-center-page"
import { createWebPageMetadata } from "@/shared/site/web-page-metadata"
import type { LangPageProps } from "@/shared/types/web.app.types"

export async function generateMetadata(
  props: LangPageProps
): Promise<Metadata> {
  return createWebPageMetadata(props, "helpCenter")
}

export default async function HelpPage(props: LangPageProps) {
  return WebHelpCenterPage(props)
}
