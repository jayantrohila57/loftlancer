"use client"

import { useOrgSessionActiveId } from "@modules/org"
import { useStorageApi } from "@modules/storage/client/hooks/storage.api"
import { formatStorageBytes } from "@modules/storage/utils/storage.format-bytes"
import { Badge } from "@packages/ui/components/badge"
import { Button } from "@packages/ui/components/button"
import { Skeleton } from "@packages/ui/components/skeleton"
import { Sparkles, Undo2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { shouldWarnBillingDowngradeOverQuota } from "../../utils/billing.downgrade-quota"
import { useBillingApi } from "../hooks/billing.api"
import { useBillingPlans } from "../hooks/billing.hook.plans"
import { useInvalidateBillingSubscriptionQueries } from "../hooks/billing.hook.subscription-cache"
import { BillingAccessGate } from "./billing.access-gate.client"

function PlansSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-24 w-full max-w-lg" />
      <Skeleton className="h-24 w-full max-w-lg" />
    </div>
  )
}

export function BillingPlansScreen() {
  const t = useTranslations("ui")
  const organizationId = useOrgSessionActiveId()
  const plans = useBillingPlans(organizationId)
  const overview = useBillingApi.useOverview(organizationId)
  const storageOverview = useStorageApi.useOverview(organizationId)
  const invalidateSubscriptionQueries =
    useInvalidateBillingSubscriptionQueries(organizationId)
  const [pending, setPending] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  async function onUpgrade() {
    setActionError(null)
    setPending(true)
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
      setPending(false)
    }
  }

  async function onDowngrade() {
    setActionError(null)
    setPending(true)
    try {
      const result = await useBillingApi.postDowngrade()
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
      setPending(false)
    }
  }

  async function onCancel() {
    setActionError(null)
    setPending(true)
    try {
      await useBillingApi.postCancel()
      await invalidateSubscriptionQueries()
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : t("operationFailed")
      )
    } finally {
      setPending(false)
    }
  }

  const autumnReady =
    overview.data?.autumnConfigured && overview.data.autumnBound
  const currentPlanTier = plans.data?.plans.find((plan) => plan.isCurrent)?.tier
  const freeQuotaBytes = plans.data?.plans.find(
    (plan) => plan.tier === "free"
  )?.quotaBytes
  const showDowngradeOverQuotaWarning = shouldWarnBillingDowngradeOverQuota({
    currentPlanTier,
    usedBytes: storageOverview.data?.usedBytes,
    freeQuotaBytes,
  })

  return (
    <BillingAccessGate>
      {plans.isPending ? <PlansSkeleton /> : null}
      {plans.isError || !plans.data ? (
        <p className="text-sm text-muted-foreground" role="status">
          {t("billingOverviewLoadError")}
        </p>
      ) : null}
      {showDowngradeOverQuotaWarning &&
      storageOverview.data &&
      freeQuotaBytes !== undefined ? (
        <p
          className="max-w-lg text-sm text-amber-600 dark:text-amber-500"
          role="status"
        >
          {t("billingDowngradeOverQuotaWarning", {
            used: formatStorageBytes(storageOverview.data.usedBytes),
            limit: formatStorageBytes(freeQuotaBytes),
          })}
        </p>
      ) : null}
      {plans.data ? (
        <ul className="flex max-w-lg flex-col gap-4">
          {plans.data.plans.map((plan) => {
            const label =
              plan.tier === "paid" ? t("storagePlanPaid") : t("storagePlanFree")
            return (
              <li
                key={plan.planId}
                className="flex flex-col gap-3 rounded-lg border p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-medium">{label}</h3>
                  {plan.isCurrent ? (
                    <Badge variant="secondary">
                      {t("billingCurrentPlanBadge")}
                    </Badge>
                  ) : null}
                </div>
                <dl className="grid gap-2 text-sm text-muted-foreground">
                  <div className="flex flex-wrap gap-x-2">
                    <dt>{t("billingIncludedStorage")}</dt>
                    <dd className="text-foreground tabular-nums">
                      {formatStorageBytes(plan.quotaBytes)}
                    </dd>
                  </div>
                  <div className="flex flex-wrap gap-x-2">
                    <dt>{t("billingAiEnabled")}</dt>
                    <dd className="text-foreground">
                      {plan.aiEnabled ? t("billingYes") : t("billingNo")}
                    </dd>
                  </div>
                </dl>
                {!plan.isCurrent && autumnReady ? (
                  plan.tier === "paid" ? (
                    <Button disabled={pending} onClick={() => void onUpgrade()}>
                      <Sparkles className="size-4" />
                      {t("billingUpgradeToPaid")}
                    </Button>
                  ) : (
                    <Button
                      disabled={pending}
                      variant="outline"
                      onClick={() => void onDowngrade()}
                    >
                      <Undo2 className="size-4" />
                      {t("billingDowngradeToFree")}
                    </Button>
                  )
                ) : null}
                {plan.isCurrent &&
                plan.tier === "paid" &&
                autumnReady &&
                !overview.data?.cancelAtPeriodEnd ? (
                  <Button
                    disabled={pending}
                    variant="outline"
                    onClick={() => void onCancel()}
                  >
                    {t("billingCancelAtPeriodEnd")}
                  </Button>
                ) : null}
                {plan.isCurrent && overview.data?.cancelAtPeriodEnd ? (
                  <p className="text-sm text-muted-foreground" role="status">
                    {t("billingCancelScheduled")}
                  </p>
                ) : null}
              </li>
            )
          })}
        </ul>
      ) : null}
      {!overview.data?.autumnConfigured ? (
        <p className="mt-4 text-sm text-muted-foreground" role="status">
          {t("billingAutumnUnconfigured")}
        </p>
      ) : null}
      {actionError ? (
        <p className="text-sm text-destructive" role="alert">
          {actionError}
        </p>
      ) : null}
    </BillingAccessGate>
  )
}
