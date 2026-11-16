"use client"

import { useOrgSessionActiveId } from "@modules/org"
import { formatStorageBytes } from "@modules/storage/utils/storage.format-bytes"
import { Skeleton } from "@packages/ui/components/skeleton"
import { useFormatter, useTranslations } from "next-intl"

import { useBillingApi } from "../hooks/billing.api"
import { BillingAccessGate } from "./billing.access-gate.client"
import { BillingUsageMeters } from "./billing.usage-meters.client"

function EntitlementsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-32 w-full max-w-xl" />
    </div>
  )
}

export function BillingUsageEntitlementsScreen() {
  const t = useTranslations("ui")
  const format = useFormatter()
  const organizationId = useOrgSessionActiveId()
  const overview = useBillingApi.useOverview(organizationId)

  return (
    <BillingAccessGate>
      {overview.isPending ? <EntitlementsSkeleton /> : null}
      {overview.isError || !overview.data ? (
        <p className="text-sm text-muted-foreground" role="status">
          {t("billingOverviewLoadError")}
        </p>
      ) : null}
      {overview.data ? (
        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">{t("usageAndEntitlements")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("billingUsageEntitlementsDescription")}
            </p>
          </section>
          <BillingUsageMeters
            usedBytes={overview.data.usedBytes}
            quotaBytes={overview.data.quotaBytes}
            aiCreditBalance={overview.data.aiCreditBalance}
            aiCreditsIncluded={overview.data.aiCreditsIncluded}
          />
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">
                {t("billingIncludedStorage")}
              </dt>
              <dd className="font-medium tabular-nums">
                {formatStorageBytes(overview.data.quotaBytes)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t("billingAiCredits")}</dt>
              <dd className="font-medium tabular-nums">
                {overview.data.aiCreditBalance}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">
                {t("billingStorageCredits")}
              </dt>
              <dd className="font-medium tabular-nums">
                {overview.data.storageCreditBalance}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t("billingAiEnabled")}</dt>
              <dd className="font-medium">
                {overview.data.aiEnabled ? t("billingYes") : t("billingNo")}
              </dd>
            </div>
          </dl>
          {overview.data.entitlementsDegraded ? (
            <p
              className="text-sm text-amber-600 dark:text-amber-500"
              role="status"
            >
              {t("billingEntitlementsDegraded")}
            </p>
          ) : null}
          {overview.data.entitlementsSyncedAt ? (
            <p className="text-xs text-muted-foreground">
              {t("billingEntitlementsSyncedAt", {
                date: format.dateTime(
                  new Date(overview.data.entitlementsSyncedAt),
                  "dateTime"
                ),
              })}
            </p>
          ) : null}
        </div>
      ) : null}
    </BillingAccessGate>
  )
}
