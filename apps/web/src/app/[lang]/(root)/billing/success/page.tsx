import type { Metadata } from "next"
import {
  getServerTranslations,
  initRequestI18n,
} from "@/shared/i18n/web.i18n.server"
import { WebPricingStatusPage } from "@/shared/pricing/web-pricing-status-page"
import type { LangPageProps } from "@/shared/types/web.app.types"

export const instant = false

export async function generateMetadata({
  params,
}: LangPageProps): Promise<Metadata> {
  await initRequestI18n(params)
  const t = await getServerTranslations(params, "pricing")
  return {
    title: t("statusSuccessTitle"),
    description: t("statusSuccessBody"),
  }
}

export default async function BillingSuccessRoute(props: LangPageProps) {
  return WebPricingStatusPage({ ...props, kind: "success" })
}
