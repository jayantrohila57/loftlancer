import type { Metadata } from "next"
import {
  getServerTranslations,
  initRequestI18n,
} from "@/shared/i18n/web.i18n.server"
import type { WebProductPageId } from "@/shared/site/web-product-page"
import type { LangPageProps } from "@/shared/types/web.app.types"

export async function createWebProductMetadata(
  { params }: LangPageProps,
  productId: WebProductPageId
): Promise<Metadata> {
  await initRequestI18n(params)
  const t = await getServerTranslations(params, "productPages")
  return {
    title: t(`${productId}.metaTitle`),
    description: t(`${productId}.metaDescription`),
  }
}
