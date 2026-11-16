"use client"

import type { BillingAdminOrgRow } from "@packages/billing"
import { Button } from "@packages/ui/components/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@packages/ui/components/table"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { useRouter } from "@/shared/i18n/console.i18n"

import { grantConsoleOrganizationPlan } from "./console-billing.actions"

export function ConsoleBillingAdminTable(props: {
  readonly orgs: readonly BillingAdminOrgRow[]
}) {
  const t = useTranslations("ui")
  const router = useRouter()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function grant(organizationId: string, planTier: "free" | "paid") {
    setError(null)
    setPendingId(`${organizationId}:${planTier}`)
    try {
      const result = await grantConsoleOrganizationPlan({
        organizationId,
        planTier,
      })
      if (!result.ok) {
        setError(result.message)
        return
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : t("billingAdminGrantError"))
    } finally {
      setPendingId(null)
    }
  }

  if (props.orgs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{t("billingAdminEmpty")}</p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("billingAdminOrganization")}</TableHead>
            <TableHead>{t("billingCurrentPlan")}</TableHead>
            <TableHead>{t("billingSubscriptionStatus")}</TableHead>
            <TableHead>{t("billingUsageStorage")}</TableHead>
            <TableHead>{t("billingAiCredits")}</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {props.orgs.map((org) => (
            <TableRow key={org.organizationId}>
              <TableCell>
                <div className="flex flex-col">
                  <span>{org.organizationName ?? org.organizationId}</span>
                  {org.cancelAtPeriodEnd ? (
                    <span className="text-xs text-muted-foreground">
                      {t("billingCancelScheduled")}
                    </span>
                  ) : null}
                  {org.paymentGraceUntil ? (
                    <span className="text-xs text-amber-600">
                      {t("billingGracePeriod")}
                    </span>
                  ) : null}
                </div>
              </TableCell>
              <TableCell className="capitalize">{org.planTier}</TableCell>
              <TableCell className="capitalize">
                {org.subscriptionStatus}
              </TableCell>
              <TableCell className="tabular-nums">
                {t("billingUsageFraction", {
                  used: org.usedBytes,
                  included: org.quotaBytes,
                })}
              </TableCell>
              <TableCell className="tabular-nums">
                {org.aiCreditBalance}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    disabled={pendingId !== null}
                    onClick={() => void grant(org.organizationId, "paid")}
                  >
                    {t("billingAdminGrantPaid")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pendingId !== null}
                    onClick={() => void grant(org.organizationId, "free")}
                  >
                    {t("billingAdminGrantFree")}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
