import { buildAuthSignInLocation } from "@modules/auth"
import { initRequestI18n } from "@/shared/i18n/web.i18n.server"
import { WebSitePricingSectionClient } from "@/shared/marketing/web-site-pricing-section.client"
import { loadWebPricingPlans } from "@/shared/pricing/web-pricing-catalog"
import { WebPricingCheckoutResume } from "@/shared/pricing/web-pricing-checkout.client"
import type { LangPageProps } from "@/shared/types/web.app.types"

export async function WebSitePricingSection({
  params,
  searchParams,
}: LangPageProps & {
  searchParams?: Promise<{ plan?: string | string[] }>
}) {
  const { locale } = await initRequestI18n(params)
  const signInHref = buildAuthSignInLocation({ locale })
  const plans = await loadWebPricingPlans()
  const query = searchParams ? await searchParams : undefined
  const planParam = query?.plan
  const resumePlanId = typeof planParam === "string" ? planParam : null
  const paidPlan = plans.find((plan) => plan.tier === "paid") ?? null

  return (
    <>
      <WebPricingCheckoutResume planId={resumePlanId} plans={plans} />
      <WebSitePricingSectionClient
        paidPlan={paidPlan}
        signInHref={signInHref}
      />
    </>
  )
}
