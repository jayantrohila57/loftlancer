"use client"

import { useShellNavigation } from "@features/shell"
import {
  useOrgSessionActiveId,
  useOrgSessionActiveIdPending,
} from "@modules/org"
import { useAccountHubHref } from "@modules/shell"
import { Button } from "@packages/ui/components/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@packages/ui/components/empty"
import { Skeleton } from "@packages/ui/components/skeleton"
import { CreditCard, Sparkles } from "lucide-react"
import { useTranslations } from "next-intl"

import type { AiUsageOverviewData } from "../../utils/types/ai-usage.types.overview"
import { useAiUsageApi } from "../hooks/ai-usage.api"

function AiUsageOverviewSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-4 w-full max-w-md" />
      <Skeleton className="h-4 w-32" />
    </div>
  )
}

function invokeStatusLabel(
  t: ReturnType<typeof useTranslations<"ui">>,
  status: AiUsageOverviewData["invokeStatus"]
): string {
  switch (status) {
    case "ready":
      return t("aiUsageStatusReady")
    case "ai_disabled":
      return t("aiUsageStatusAiDisabled")
    case "no_credits":
      return t("aiUsageStatusNoCredits")
    case "subscription_inactive":
      return t("aiUsageStatusSubscriptionInactive")
    case "entitlements_degraded":
      return t("aiUsageStatusEntitlementsDegraded")
    default:
      return t("aiUsageStatusEntitlementUnavailable")
  }
}

export function AiUsageOverviewScreen() {
  const t = useTranslations("ui")
  const { Link } = useShellNavigation()
  const billingHref = useAccountHubHref("/account/billing")
  const orgResolving = useOrgSessionActiveIdPending()
  const organizationId = useOrgSessionActiveId()
  const overview = useAiUsageApi.useOverview(organizationId)

  if (orgResolving) return <AiUsageOverviewSkeleton />

  if (!organizationId) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Sparkles />
          </EmptyMedia>
          <EmptyTitle>{t("aiUsageNoActiveOrgTitle")}</EmptyTitle>
          <EmptyDescription>
            {t("aiUsageNoActiveOrgDescription")}
          </EmptyDescription>
        </EmptyHeader>
        <Button render={<Link href="/organizations/list" />}>
          {t("organizations")}
        </Button>
      </Empty>
    )
  }

  if (overview.isPending) return <AiUsageOverviewSkeleton />

  if (overview.isError || !overview.data) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        {t("aiUsageOverviewLoadError")}
      </p>
    )
  }

  const data = overview.data
  const planLabel =
    data.planTier === "paid" ? t("storagePlanPaid") : t("storagePlanFree")

  return (
    <div className="flex flex-col gap-6">
      <dl className="grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">{t("billingCurrentPlan")}</dt>
          <dd className="font-medium">{planLabel}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("billingAiEnabled")}</dt>
          <dd className="font-medium">
            {data.aiEnabled ? t("billingYes") : t("billingNo")}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("billingAiCredits")}</dt>
          <dd className="font-medium tabular-nums">{data.aiCreditBalance}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("aiUsageInvokeStatus")}</dt>
          <dd className="font-medium">
            {invokeStatusLabel(t, data.invokeStatus)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">
            {t("aiUsageSettledInvokes")}
          </dt>
          <dd className="font-medium tabular-nums">
            {data.settledLedgerCount}
          </dd>
        </div>
      </dl>

      {!data.autumnConfigured ? (
        <p className="text-sm text-muted-foreground" role="status">
          {t("billingAutumnUnconfigured")}
        </p>
      ) : null}

      {data.entitlementsDegraded ? (
        <p className="text-sm text-amber-600 dark:text-amber-500" role="status">
          {t("billingEntitlementsDegraded")}
        </p>
      ) : null}

      <p className="text-sm text-muted-foreground" role="status">
        {t("aiUsageMeteredRoutesPendingDescription")}
      </p>

      {data.isOrgOwner &&
      data.aiEnabled &&
      (data.invokeStatus === "no_credits" || data.aiCreditBalance === 0) ? (
        <Button render={<Link href={billingHref} />}>
          <CreditCard className="size-4" />
          {t("aiUsageBuyCreditsCta")}
        </Button>
      ) : null}

      {!data.isOrgOwner && data.invokeStatus === "no_credits" ? (
        <p className="text-sm text-muted-foreground" role="status">
          {t("aiUsageAskOwnerForCredits")}
        </p>
      ) : null}
    </div>
  )
}
