import type { Metadata } from "next"
import { WebContactPage } from "@/shared/contact/web-contact-page"
import { createWebPageMetadata } from "@/shared/site/web-page-metadata"
import type { LangPageProps } from "@/shared/types/web.app.types"

export async function generateMetadata(
  props: LangPageProps
): Promise<Metadata> {
  return createWebPageMetadata(props, "contactPage")
}

export default async function ContactPage(props: LangPageProps) {
  return WebContactPage(props)
}
