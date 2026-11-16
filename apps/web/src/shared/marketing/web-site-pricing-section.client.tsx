"use client"

import { Badge } from "@packages/ui/components/badge"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@packages/ui/components/card"
import { Tabs, TabsList, TabsTab } from "@packages/ui/components/tabs"
import { cn } from "@packages/ui/lib/utils"
import { Check } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { WebSitePricingComparisonClient } from "@/shared/marketing/web-site-pricing-comparison.client"
import { WebSitePricingCta } from "@/shared/marketing/web-site-pricing-cta.client"
import { WebSitePricingFaqClient } from "@/shared/marketing/web-site-pricing-faq.client"
import type { WebPricingPlanView } from "@/shared/pricing/web-pricing-types"

const PRICING_TIERS = [
  { id: "starter", contactSales: false },
  { id: "pro", contactSales: false, featured: true },
  { id: "studio", contactSales: true },
  { id: "enterprise", contactSales: true },
] as const

type PricingTierId = (typeof PRICING_TIERS)[number]["id"]
type BillingPeriod = "monthly" | "yearly"

export interface WebSitePricingSectionClientProps {
  readonly paidPlan: WebPricingPlanView | null
  readonly signInHref: string
}

type PricingTierMessageKey =
  | "name"
  | "description"
  | "priceMonthly"
  | "priceYearly"
  | "cta"
  | "usageLabel"
  | "usageItems"
  | "features"

function tierPath<K extends PricingTierMessageKey>(
  tierId: PricingTierId,
  key: K
) {
  return `tiers.${tierId}.${key}` as const
}

export function WebSitePricingSectionClient({
  paidPlan,
  signInHref,
}: WebSitePricingSectionClientProps) {
  const t = useTranslations("pricingPage")
  const [billing, setBilling] = useState<BillingPeriod>("monthly")

  return (
    <section className="mx-auto flex w-full flex-col items-center gap-10 px-4 py-8 sm:px-6 md:py-12">
      <header className="flex max-w-3xl flex-col items-start gap-3 self-start text-left">
        <p className="text-sm font-medium text-muted-foreground">
          {t("eyebrow")}
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl md:text-5xl">
          {t("title")}
        </h1>
        <p className="max-w-2xl text-base text-pretty text-muted-foreground sm:text-lg">
          {t("subtitle")}
        </p>
      </header>

      <div className="flex flex-col items-start gap-3 self-start">
        <Tabs
          onValueChange={(value) => {
            if (value === "monthly" || value === "yearly") {
              setBilling(value)
            }
          }}
          value={billing}
        >
          <TabsList aria-label={t("billingToggleLabel")}>
            <TabsTab value="monthly">{t("billingMonthly")}</TabsTab>
            <TabsTab className="gap-1.5" value="yearly">
              {t("billingYearly")}
              <Badge size="sm" variant="success">
                {t("yearlySaveBadge")}
              </Badge>
            </TabsTab>
          </TabsList>
        </Tabs>
        <p className="text-left text-sm text-muted-foreground">
          {t("billingNote")}
        </p>
      </div>

      <ul className="grid w-full grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
        {PRICING_TIERS.map((tier) => {
          const { id: tierId, contactSales } = tier
          const highlighted = "featured" in tier && tier.featured === true
          const features = t.raw(tierPath(tierId, "features")) as string[]
          const usageItems = t.raw(tierPath(tierId, "usageItems")) as string[]
          const monthlyPrice = t(tierPath(tierId, "priceMonthly"))
          const yearlyPrice = t(tierPath(tierId, "priceYearly"))
          const displayPrice =
            billing === "monthly" ? monthlyPrice : yearlyPrice
          const periodLabel =
            billing === "monthly" ? t("perMonth") : t("perYear")

          return (
            <li key={tierId} className="flex min-h-0">
              <Card
                className={cn(
                  "h-full w-full rounded-lg before:rounded-[calc(var(--radius-lg)-1px)]",
                  highlighted &&
                    "z-1 border-primary shadow-md ring-1 ring-primary/20 md:-my-1 md:py-1"
                )}
              >
                <CardHeader className="gap-3 pb-4">
                  <div className="flex w-full items-start justify-between gap-3">
                    <CardTitle className="text-xl">
                      {t(tierPath(tierId, "name"))}
                    </CardTitle>
                    {highlighted ? (
                      <Badge className="shrink-0" variant="secondary">
                        {t("popularBadge")}
                      </Badge>
                    ) : null}
                  </div>
                  <CardDescription className="text-pretty">
                    {t(tierPath(tierId, "description"))}
                  </CardDescription>
                  <div className="pt-1">
                    <p className="font-heading text-4xl font-semibold tracking-tight tabular-nums">
                      <span
                        className="inline-block transition-opacity duration-200 ease-out"
                        key={`${tierId}-${billing}`}
                      >
                        {displayPrice}
                      </span>
                      <span className="text-base font-normal text-muted-foreground">
                        {periodLabel}
                      </span>
                    </p>
                  </div>
                  <div className="border-t border-border/60 pt-3">
                    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      {t(tierPath(tierId, "usageLabel"))}
                    </p>
                    <ul className="mt-1.5 flex flex-col gap-1">
                      {usageItems.map((item) => (
                        <li
                          key={item}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <span
                            aria-hidden
                            className="size-1 shrink-0 rounded-full bg-muted-foreground/70"
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardHeader>
                <CardPanel className="flex flex-1 flex-col gap-4 pt-0">
                  <ul className="flex flex-col gap-2.5">
                    {features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-sm text-foreground/90"
                      >
                        <Check
                          aria-hidden
                          className="mt-0.5 size-4 shrink-0 text-primary"
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardPanel>
                <CardFooter className="mt-auto border-0 pt-2 pb-6">
                  <WebSitePricingCta
                    className="w-full"
                    kind={
                      contactSales
                        ? "contact"
                        : highlighted
                          ? "checkout"
                          : "start"
                    }
                    label={t(tierPath(tierId, "cta"))}
                    paidPlan={paidPlan}
                    signInHref={signInHref}
                    size="lg"
                    variant={highlighted ? "default" : "outline"}
                  />
                </CardFooter>
              </Card>
            </li>
          )
        })}
      </ul>

      <div className="w-full self-start border-t border-border/60 pt-10">
        <WebSitePricingComparisonClient
          billing={billing}
          paidPlan={paidPlan}
          signInHref={signInHref}
        />
      </div>

      <div className="w-full self-start border-t border-border/60 pt-10">
        <WebSitePricingFaqClient />
      </div>
    </section>
  )
}
