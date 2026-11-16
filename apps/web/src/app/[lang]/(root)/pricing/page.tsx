import type { Metadata } from "next"
import {
  getServerTranslations,
  initRequestI18n,
} from "@/shared/i18n/web.i18n.server"
import { WebPricingPage } from "@/shared/pricing/web-pricing-page"
import type { LangPageProps } from "@/shared/types/web.app.types"

export const instant = false

export async function generateMetadata({
  params,
}: LangPageProps): Promise<Metadata> {
  await initRequestI18n(params)
  const t = await getServerTranslations(params, "pricing")
  return {
    title: t("title"),
    description: t("description"),
  }
}

export default async function PricingRoute(
  props: LangPageProps & {
    searchParams: Promise<{ plan?: string | string[] }>
  }
) {
  return WebPricingPage(props)
}
