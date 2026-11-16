import { Badge } from "@packages/ui/components/badge"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@packages/ui/components/card"
import { cn } from "@packages/ui/lib/utils"
import { Check } from "lucide-react"
import type { ReactNode } from "react"
import { formatPlanPriceLabel } from "@/shared/pricing/web-pricing-money"
import type { WebPricingPlanView } from "@/shared/pricing/web-pricing-types"

export type WebPricingPlansTranslate = {
  readonly freeName: string
  readonly paidName: string
  readonly freeDescription: string
  readonly paidDescription: string
  readonly featureStorage: (values: { size: number }) => string
  readonly featureAiIncluded: string
  readonly featureAiNotIncluded: string
  readonly priceFree: string
  readonly priceUnavailable: string
  readonly intervalMonth: string
  readonly intervalYear: string
  readonly intervalOnce: string
  readonly popularBadge: string
  readonly pricePerInterval: (values: {
    price: string
    interval: string
  }) => string
}

export function WebPricingPlans({
  actions,
  locale,
  plans,
  translate,
}: {
  readonly actions: (plan: WebPricingPlanView) => ReactNode
  readonly locale: string
  readonly plans: readonly WebPricingPlanView[]
  readonly translate: WebPricingPlansTranslate
}) {
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6 md:grid-cols-2">
      {plans.map((plan) => (
        <WebPricingPlanCard
          key={plan.planId}
          locale={locale}
          plan={plan}
          translate={translate}
        >
          {actions(plan)}
        </WebPricingPlanCard>
      ))}
    </div>
  )
}

function WebPricingPlanCard({
  children,
  locale,
  plan,
  translate,
}: {
  readonly children: ReactNode
  readonly locale: string
  readonly plan: WebPricingPlanView
  readonly translate: WebPricingPlansTranslate
}) {
  const isPaid = plan.tier === "paid"
  const name = isPaid ? translate.paidName : translate.freeName
  const description = isPaid
    ? translate.paidDescription
    : translate.freeDescription
  const features = [
    translate.featureStorage({ size: plan.quotaGib }),
    plan.aiEnabled
      ? translate.featureAiIncluded
      : translate.featureAiNotIncluded,
  ]
  const priceLabel = formatPlanPriceLabel(plan, locale, translate)

  return (
    <Card
      className={cn(
        "flex h-full min-h-[28rem] flex-col",
        isPaid && "border-primary/40 shadow-sm"
      )}
    >
      <CardHeader className="gap-3">
        <div className="flex min-h-7 items-center justify-between gap-2">
          <CardTitle>{name}</CardTitle>
          {isPaid ? (
            <Badge>{translate.popularBadge}</Badge>
          ) : (
            <span className="h-5" />
          )}
        </div>
        <CardDescription>{description}</CardDescription>
        <p className="min-h-16 pt-2 font-heading text-4xl font-semibold tracking-tight">
          {priceLabel}
        </p>
      </CardHeader>
      <CardPanel>
        <ul className="flex flex-col gap-3 text-sm">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <Check
                aria-hidden
                className="mt-0.5 size-4 shrink-0 text-primary"
              />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardPanel>
      <CardFooter className="mt-auto min-h-16">{children}</CardFooter>
    </Card>
  )
}
