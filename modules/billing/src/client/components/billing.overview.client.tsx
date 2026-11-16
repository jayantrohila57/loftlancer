"use client"

import { useOrgSessionActiveId } from "@modules/org"
import { formatStorageBytes } from "@modules/storage/utils/storage.format-bytes"
import { Button } from "@packages/ui/components/button"
import { Skeleton } from "@packages/ui/components/skeleton"
import { BadgeCheck, Sparkles } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { useBillingApi } from "../hooks/billing.api"
import { markBillingPortalLaunch } from "../hooks/billing.hook.portal-return-refresh"
import { useInvalidateBillingSubscriptionQueries } from "../hooks/billing.hook.subscription-cache"
import { BillingAccessGate } from "./billing.access-gate.client"
import { BillingUsageMeters } from "./billing.usage-meters.client"

function BillingOverviewSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-10 w-full max-w-md" />
      <Skeleton className="h-10 w-40" />
    </div>
  )
}

function BillingOverviewBody() {
  const t = useTranslations("ui")
  const organizationId = useOrgSessionActiveId()
  const overview = useBillingApi.useOverview(organizationId)
  const invalidateSubscriptionQueries =
    useInvalidateBillingSubscriptionQueries(organizationId)
  const [actionPending, setActionPending] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  if (overview.isPending) return <BillingOverviewSkeleton />

  if (overview.isError || !overview.data) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        {t("billingOverviewLoadError")}
      </p>
    )
  }

  const data = overview.data
  const planLabel =
    data.planTier === "paid" ? t("storagePlanPaid") : t("storagePlanFree")
  const quotaLabel = formatStorageBytes(data.quotaBytes)

  async function onUpgrade() {
    setActionError(null)
    setActionPending(true)
    try {
      const result = await useBillingApi.postUpgrade()
      if (result.paymentUrl) {
        window.location.assign(result.paymentUrl)
        return
      }
      await invalidateSubscriptionQueries()
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : t("operationFailed")
      )
    } finally {
      setActionPending(false)
    }
  }

  async function onPortal() {
    setActionError(null)
    setActionPending(true)
    try {
      const result = await useBillingApi.postPortal()
      markBillingPortalLaunch()
      window.location.assign(result.portalUrl)
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : t("operationFailed")
      )
    } finally {
      setActionPending(false)
    }
  }

  async function onCancel() {
    setActionError(null)
    setActionPending(true)
    try {
      await useBillingApi.postCancel()
      await invalidateSubscriptionQueries()
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : t("operationFailed")
      )
    } finally {
      setActionPending(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <dl className="grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">{t("billingCurrentPlan")}</dt>
          <dd className="font-medium">{planLabel}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">
            {t("billingSubscriptionStatus")}
          </dt>
          <dd className="font-medium capitalize">{data.subscriptionStatus}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">
            {t("billingIncludedStorage")}
          </dt>
          <dd className="font-medium tabular-nums">{quotaLabel}</dd>
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
          <dt className="text-muted-foreground">
            {t("billingStorageCredits")}
          </dt>
          <dd className="font-medium tabular-nums">
            {data.storageCreditBalance}
          </dd>
        </div>
      </dl>

      <BillingUsageMeters
        usedBytes={data.usedBytes}
        quotaBytes={data.quotaBytes}
        aiCreditBalance={data.aiCreditBalance}
        aiCreditsIncluded={data.aiCreditsIncluded}
      />

      {data.paymentGraceUntil ? (
        <p className="text-sm text-amber-600 dark:text-amber-500" role="status">
          {t("billingGracePeriod")}
        </p>
      ) : null}

      {data.cancelAtPeriodEnd ? (
        <p className="text-sm text-muted-foreground" role="status">
          {t("billingCancelScheduled")}
        </p>
      ) : null}

      {data.usedBytes > data.quotaBytes && data.planTier === "free" ? (
        <p className="text-sm text-destructive" role="status">
          {t("billingReadOnlyOverLimit")}
        </p>
      ) : null}

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

      {data.provisioningStep !== "complete" ? (
        <p className="text-sm text-muted-foreground" role="status">
          {t("billingProvisioningPending")}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {data.planTier === "free" && data.autumnConfigured ? (
          <Button disabled={actionPending} onClick={() => void onUpgrade()}>
            <Sparkles className="size-4" />
            {t("billingUpgradeToPaid")}
          </Button>
        ) : null}
        {data.autumnBound && data.autumnConfigured ? (
          <Button
            disabled={actionPending}
            variant="outline"
            onClick={() => void onPortal()}
          >
            <BadgeCheck className="size-4" />
            {t("billingManagePortal")}
          </Button>
        ) : null}
        {data.planTier === "paid" &&
        data.autumnConfigured &&
        !data.cancelAtPeriodEnd ? (
          <Button
            disabled={actionPending}
            variant="outline"
            onClick={() => void onCancel()}
          >
            {t("billingCancelAtPeriodEnd")}
          </Button>
        ) : null}
      </div>

      {actionError ? (
        <p className="text-sm text-destructive" role="alert">
          {actionError}
        </p>
      ) : null}
    </div>
  )
}

export function BillingOverviewScreen() {
  return (
    <BillingAccessGate>
      <BillingOverviewBody />
    </BillingAccessGate>
  )
}
