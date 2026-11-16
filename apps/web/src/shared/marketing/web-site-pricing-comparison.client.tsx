"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@packages/ui/components/table"
import { cn } from "@packages/ui/lib/utils"
import type { LucideIcon } from "lucide-react"
import { Check, Headphones, Layers, Minus, Users } from "lucide-react"
import { useTranslations } from "next-intl"
import { Fragment } from "react"
import { WebSitePricingCta } from "@/shared/marketing/web-site-pricing-cta.client"
import type { WebPricingPlanView } from "@/shared/pricing/web-pricing-types"

const COMPARISON_TIERS = [
  { id: "starter", contactSales: false, highlighted: false },
  { id: "pro", contactSales: false, highlighted: true },
  { id: "studio", contactSales: true, highlighted: false },
  { id: "enterprise", contactSales: true, highlighted: false },
] as const

type ComparisonTierId = (typeof COMPARISON_TIERS)[number]["id"]

type CellValue = boolean | string

interface ComparisonFeatureRow {
  readonly label: string
  readonly values: Record<ComparisonTierId, CellValue>
}

interface ComparisonFeatureGroup {
  readonly id: string
  readonly title: string
  readonly icon: LucideIcon
  readonly rows: readonly ComparisonFeatureRow[]
}

const FEATURE_GROUPS: readonly ComparisonFeatureGroup[] = [
  {
    id: "platform",
    title: "Platform",
    icon: Layers,
    rows: [
      {
        label: "Usage",
        values: {
          starter: "Limited",
          pro: "Standard",
          studio: "4× Pro",
          enterprise: "Custom",
        },
      },
      {
        label: "Active projects",
        values: {
          starter: "2",
          pro: true,
          studio: true,
          enterprise: true,
        },
      },
      {
        label: "Agent-ready work breakdowns",
        values: {
          starter: false,
          pro: true,
          studio: true,
          enterprise: true,
        },
      },
      {
        label: "Scope templates & versioning",
        values: {
          starter: true,
          pro: true,
          studio: true,
          enterprise: true,
        },
      },
      {
        label: "Integrations & webhooks",
        values: {
          starter: false,
          pro: true,
          studio: true,
          enterprise: true,
        },
      },
    ],
  },
  {
    id: "collaboration",
    title: "Collaboration",
    icon: Users,
    rows: [
      {
        label: "Team seats",
        values: {
          starter: "1",
          pro: "1 (+ add-ons)",
          studio: "Up to 10",
          enterprise: "Unlimited",
        },
      },
      {
        label: "Shared workspaces",
        values: {
          starter: false,
          pro: false,
          studio: true,
          enterprise: true,
        },
      },
      {
        label: "Client portal branding",
        values: {
          starter: false,
          pro: false,
          studio: true,
          enterprise: true,
        },
      },
      {
        label: "Audit trail & approvals",
        values: {
          starter: false,
          pro: false,
          studio: true,
          enterprise: true,
        },
      },
      {
        label: "SSO & advanced security",
        values: {
          starter: false,
          pro: false,
          studio: true,
          enterprise: true,
        },
      },
    ],
  },
  {
    id: "support",
    title: "Support",
    icon: Headphones,
    rows: [
      {
        label: "Email support",
        values: {
          starter: true,
          pro: true,
          studio: true,
          enterprise: true,
        },
      },
      {
        label: "Priority support SLA",
        values: {
          starter: "48h",
          pro: "24h",
          studio: "4h",
          enterprise: "1h",
        },
      },
      {
        label: "Dedicated success manager",
        values: {
          starter: false,
          pro: false,
          studio: true,
          enterprise: true,
        },
      },
      {
        label: "Custom contracts & compliance",
        values: {
          starter: false,
          pro: false,
          studio: false,
          enterprise: true,
        },
      },
    ],
  },
]

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
  tierId: ComparisonTierId,
  key: K
) {
  return `tiers.${tierId}.${key}` as const
}

function ComparisonCell({
  includedLabel,
  notIncludedLabel,
  value,
}: {
  readonly includedLabel: string
  readonly notIncludedLabel: string
  readonly value: CellValue
}) {
  if (value === true) {
    return (
      <>
        <Check
          aria-hidden
          className="mx-auto size-4 stroke-[2.5] text-foreground"
        />
        <span className="sr-only">{includedLabel}</span>
      </>
    )
  }
  if (value === false) {
    return (
      <>
        <Minus
          aria-hidden
          className="mx-auto size-4 text-muted-foreground/45"
        />
        <span className="sr-only">{notIncludedLabel}</span>
      </>
    )
  }
  return <span className="text-sm text-muted-foreground">{value}</span>
}

const tierColumnClass =
  "min-w-28 border-border text-center align-middle sm:min-w-32"

export interface WebSitePricingComparisonClientProps {
  readonly billing: "monthly" | "yearly"
  readonly paidPlan: WebPricingPlanView | null
  readonly signInHref: string
}

export function WebSitePricingComparisonClient({
  billing,
  paidPlan,
  signInHref,
}: WebSitePricingComparisonClientProps) {
  const t = useTranslations("pricingPage")
  const periodLabel = billing === "monthly" ? t("perMonth") : t("perYear")

  return (
    <div className="flex w-full flex-col gap-6">
      <header className="flex max-w-3xl flex-col items-start gap-3 self-start text-left">
        <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          {t("comparisonTitle")}
        </h2>
        <p className="max-w-2xl text-base text-pretty text-muted-foreground sm:text-lg">
          {t("comparisonDescription")}
        </p>
      </header>

      <Table className="min-w-[44rem] border-separate border-spacing-0">
        <TableHeader>
          <TableRow className="border-y-0 *:border-border hover:bg-transparent [&>:not(:last-child)]:border-e">
            <TableHead className="sticky left-0 z-30 min-w-44 border-b bg-background align-bottom sm:min-w-52" />
            {COMPARISON_TIERS.map((tier) => {
              const { id: tierId, contactSales, highlighted } = tier
              const monthlyPrice = t(tierPath(tierId, "priceMonthly"))
              const yearlyPrice = t(tierPath(tierId, "priceYearly"))
              const displayPrice =
                billing === "monthly" ? monthlyPrice : yearlyPrice

              return (
                <TableHead
                  className={cn(
                    "sticky top-0 z-20 h-auto border-b bg-background px-2 py-4 align-bottom",
                    tierColumnClass,
                    highlighted && "bg-muted/25"
                  )}
                  data-tier={tierId}
                  key={tierId}
                >
                  <div className="flex flex-col items-center gap-2 px-1">
                    <span className="font-heading text-base font-semibold text-foreground">
                      {t(tierPath(tierId, "name"))}
                    </span>
                    <p className="font-heading text-xl font-semibold tracking-tight tabular-nums">
                      {displayPrice}
                      <span className="text-sm font-normal text-muted-foreground">
                        {periodLabel}
                      </span>
                    </p>
                    <WebSitePricingCta
                      className="w-full max-w-[9.5rem] rounded-full"
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
                      size="sm"
                      variant={highlighted ? "default" : "outline"}
                    />
                  </div>
                </TableHead>
              )
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {FEATURE_GROUPS.map((group) => (
            <Fragment key={group.id}>
              <TableRow
                className="*:border-border hover:bg-transparent [&>:not(:last-child)]:border-e"
                key={`${group.id}-heading`}
              >
                <TableCell
                  className="sticky left-0 z-10 border-t bg-background py-4 font-medium text-foreground"
                  colSpan={1}
                >
                  <div className="flex items-center gap-2">
                    <group.icon aria-hidden className="size-4 shrink-0" />
                    <span>{group.title}</span>
                  </div>
                </TableCell>
                {COMPARISON_TIERS.map((tier) => (
                  <TableCell
                    className={cn(
                      "border-t",
                      tierColumnClass,
                      tier.highlighted && "bg-muted/15"
                    )}
                    data-tier={tier.id}
                    key={`${group.id}-pad-${tier.id}`}
                  />
                ))}
              </TableRow>
              {group.rows.map((row) => (
                <TableRow
                  className="*:border-border [&>:not(:last-child)]:border-e"
                  key={`${group.id}-${row.label}`}
                >
                  <TableCell className="sticky left-0 z-10 bg-background py-3.5 text-sm text-foreground">
                    {row.label}
                  </TableCell>
                  {COMPARISON_TIERS.map((tier) => (
                    <TableCell
                      className={cn(
                        "py-3.5",
                        tierColumnClass,
                        tier.highlighted && "bg-muted/15"
                      )}
                      data-tier={tier.id}
                      key={`${group.id}-${row.label}-${tier.id}`}
                    >
                      <ComparisonCell
                        includedLabel={t("comparisonIncluded")}
                        notIncludedLabel={t("comparisonNotIncluded")}
                        value={row.values[tier.id]}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
