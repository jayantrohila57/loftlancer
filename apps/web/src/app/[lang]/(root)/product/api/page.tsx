import type { Metadata } from "next"
import { createWebProductMetadata } from "@/shared/site/web-product-metadata"
import { WebProductPage } from "@/shared/site/web-product-page"
import type { LangPageProps } from "@/shared/types/web.app.types"

export async function generateMetadata(
  props: LangPageProps
): Promise<Metadata> {
  return createWebProductMetadata(props, "api")
}

export default async function ProductApiPage(props: LangPageProps) {
  return WebProductPage({ ...props, productId: "api" })
}
