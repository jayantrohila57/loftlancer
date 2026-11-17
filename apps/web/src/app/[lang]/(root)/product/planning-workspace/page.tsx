import type { Metadata } from "next"
import { createWebProductMetadata } from "@/shared/site/web-product-metadata"
import { WebProductPage } from "@/shared/site/web-product-page"
import type { LangPageProps } from "@/shared/types/web.app.types"

export async function generateMetadata(
  props: LangPageProps
): Promise<Metadata> {
  return createWebProductMetadata(props, "planning")
}

export default async function ProductPlanningPage(props: LangPageProps) {
  return WebProductPage({ ...props, productId: "planning" })
}
