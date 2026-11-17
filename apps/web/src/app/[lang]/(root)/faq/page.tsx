import type { Metadata } from "next"
import { WebFaqPage } from "@/shared/faq/web-faq-page"
import { createWebPageMetadata } from "@/shared/site/web-page-metadata"
import type { LangPageProps } from "@/shared/types/web.app.types"

export async function generateMetadata(
  props: LangPageProps
): Promise<Metadata> {
  return createWebPageMetadata(props, "faqPage")
}

export default async function FaqPage(props: LangPageProps) {
  return WebFaqPage(props)
}
