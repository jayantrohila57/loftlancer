import Shell from "@packages/ui/components/shell"
import { getLocale } from "next-intl/server"
import { getServerTranslations } from "@/shared/i18n/web.i18n.server"
import { loadWebPricingPlans } from "@/shared/pricing/web-pricing-catalog"
import {
  WebPricingCheckoutButton,
  WebPricingCheckoutResume,
} from "@/shared/pricing/web-pricing-checkout.client"
import { WebPricingPlans } from "@/shared/pricing/web-pricing-plans"
import type { LangPageProps } from "@/shared/types/web.app.types"

export async function WebPricingPage({
  params,
  searchParams,
}: LangPageProps & {
  searchParams?: Promise<{ plan?: string | string[] }>
}) {
  const t = await getServerTranslations(params, "pricing")
  const locale = await getLocale()
  const plans = await loadWebPricingPlans()
  const query = searchParams ? await searchParams : undefined
  const planParam = query?.plan
  const resumePlanId = typeof planParam === "string" ? planParam : null

  return (
    <Shell.Section className="px-6 py-16" variant="site">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-muted-foreground">
            {t("eyebrow")}
          </p>
          <h1 className="mt-2 font-heading text-4xl font-semibold tracking-tight">
            {t("title")}
          </h1>
          <p className="mt-3 text-pretty text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <WebPricingCheckoutResume planId={resumePlanId} plans={plans} />
        <WebPricingPlans
          locale={locale}
          plans={plans}
          translate={{
            featureAiIncluded: t("featureAiIncluded"),
            featureAiNotIncluded: t("featureAiNotIncluded"),
            featureStorage: (values) => t("featureStorage", values),
            freeDescription: t("freeDescription"),
            freeName: t("freeName"),
            intervalMonth: t("intervalMonth"),
            intervalOnce: t("intervalOnce"),
            intervalYear: t("intervalYear"),
            paidDescription: t("paidDescription"),
            paidName: t("paidName"),
            popularBadge: t("popularBadge"),
            priceFree: t("priceFree"),
            pricePerInterval: (values) => t("pricePerInterval", values),
            priceUnavailable: t("priceUnavailable"),
          }}
          actions={(plan) => <WebPricingCheckoutButton plan={plan} />}
        />
      </div>
    </Shell.Section>
  )
}
