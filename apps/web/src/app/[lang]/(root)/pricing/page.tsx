import Shell from "@packages/ui/components/shell"
import type { Metadata } from "next"
import {
  getServerTranslations,
  initRequestI18n,
} from "@/shared/i18n/web.i18n.server"
import { WebSitePricingSection } from "@/shared/marketing/web-site-pricing-section"
import type { LangPageProps } from "@/shared/types/web.app.types"

export const instant = false

export async function generateMetadata({
  params,
}: LangPageProps): Promise<Metadata> {
  await initRequestI18n(params)
  const t = await getServerTranslations(params, "pricingPage")
  return {
    title: t("title"),
    description: t("subtitle"),
  }
}

export default async function PricingPage({
  params,
  searchParams,
}: LangPageProps & {
  searchParams: Promise<{ plan?: string | string[] }>
}) {
  return (
    <Shell.Section variant="site">
      <WebSitePricingSection params={params} searchParams={searchParams} />
    </Shell.Section>
  )
}
