"use client"

import { useShellNavigation } from "@features/shell"
import { useOrgSessionActiveId } from "@modules/org"
import { formatStorageBytes } from "@modules/storage"
import { Button } from "@packages/ui/components/button"
import { Skeleton } from "@packages/ui/components/skeleton"
import { BadgeCheck } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { useBillingApi } from "../hooks/billing.api"
import { markBillingPortalLaunch } from "../hooks/billing.hook.portal-return-refresh"
import { BillingAccessGate } from "./billing.access-gate.client"

function SummarySkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-10 w-full max-w-md" />
    </div>
  )
}

export function BillingSubscriptionSummaryScreen() {
  const t = useTranslations("ui")
  const { Link } = useShellNavigation()
  const organizationId = useOrgSessionActiveId()
  const overview = useBillingApi.useOverview(organizationId)
  const [actionPending, setActionPending] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  return (
    <BillingAccessGate>
      {overview.isPending ? <SummarySkeleton /> : null}
      {overview.isError || !overview.data ? (
        <p className="text-sm text-muted-foreground" role="status">
          {t("billingOverviewLoadError")}
        </p>
      ) : null}
      {overview.data ? (
        <div className="flex flex-col gap-6">
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">
                {t("billingCurrentPlan")}
              </dt>
              <dd className="font-medium">
                {overview.data.planTier === "paid"
                  ? t("storagePlanPaid")
                  : t("storagePlanFree")}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">
                {t("billingSubscriptionStatus")}
              </dt>
              <dd className="font-medium capitalize">
                {overview.data.subscriptionStatus}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">
                {t("billingIncludedStorage")}
              </dt>
              <dd className="font-medium tabular-nums">
                {formatStorageBytes(overview.data.quotaBytes)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t("billingAiEnabled")}</dt>
              <dd className="font-medium">
                {overview.data.aiEnabled ? t("billingYes") : t("billingNo")}
              </dd>
            </div>
          </dl>
          <div className="flex flex-wrap gap-2">
            <Button
              render={<Link href="/account/subscription/available-plans" />}
            >
              {t("availablePlans")}
            </Button>
            <Button
              render={<Link href="/account/subscription/usage-entitlements" />}
              variant="outline"
            >
              {t("usageAndEntitlements")}
            </Button>
            {overview.data.autumnBound && overview.data.autumnConfigured ? (
              <Button
                disabled={actionPending}
                variant="outline"
                onClick={() => {
                  setActionError(null)
                  setActionPending(true)
                  void useBillingApi
                    .postPortal()
                    .then((result) => {
                      markBillingPortalLaunch()
                      window.location.assign(result.portalUrl)
                    })
                    .catch((error: unknown) => {
                      setActionError(
                        error instanceof Error
                          ? error.message
                          : t("operationFailed")
                      )
                    })
                    .finally(() => {
                      setActionPending(false)
                    })
                }}
              >
                <BadgeCheck className="size-4" />
                {t("billingManagePortal")}
              </Button>
            ) : null}
          </div>
          {actionError ? (
            <p className="text-sm text-destructive" role="alert">
              {actionError}
            </p>
          ) : null}
        </div>
      ) : null}
    </BillingAccessGate>
  )
}
