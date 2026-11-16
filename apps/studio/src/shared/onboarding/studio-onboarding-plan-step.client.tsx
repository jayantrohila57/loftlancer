"use client"

import { useBillingPlans } from "@modules/billing"
import { useOrgSessionActiveId } from "@modules/org"
import { formatStorageBytes } from "@modules/storage/utils/storage.format-bytes"
import { Badge } from "@packages/ui/components/badge"
import { Button } from "@packages/ui/components/button"
import { Label } from "@packages/ui/components/label"
import { RadioGroup, RadioGroupItem } from "@packages/ui/components/radio-group"
import { Skeleton } from "@packages/ui/components/skeleton"
import { useLocale, useTranslations } from "next-intl"
import { useMemo, useState } from "react"
import { continueStudioOnboardingPlan } from "@/shared/onboarding/studio-onboarding.actions.server"

export function StudioOnboardingPlanStep() {
  const t = useTranslations("ui")
  const locale = useLocale()
  const organizationId = useOrgSessionActiveId()
  const plans = useBillingPlans(organizationId)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [planTier, setPlanTier] = useState<"free" | "paid" | "">("")

  const options = useMemo(() => {
    if (!plans.data?.plans) return []
    return plans.data.plans.map((plan) => ({
      tier: plan.tier,
      quotaBytes: plan.quotaBytes,
      aiEnabled: plan.aiEnabled,
      isCurrent: plan.isCurrent,
      label: plan.tier === "paid" ? t("storagePlanPaid") : t("storagePlanFree"),
    }))
  }, [plans.data?.plans, t])

  async function onContinue() {
    if (planTier !== "free" && planTier !== "paid") {
      setError(t("onboardingPlanChoiceRequired"))
      return
    }
    setError(null)
    setPending(true)
    try {
      await continueStudioOnboardingPlan(locale, planTier)
    } catch (err) {
      setError(err instanceof Error ? err.message : t("operationFailed"))
      setPending(false)
    }
  }

  return (
    <div className="flex max-w-lg flex-col gap-4">
      {plans.isPending ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : null}
      {plans.isError ? (
        <p className="text-sm text-muted-foreground" role="status">
          {t("billingOverviewLoadError")}
        </p>
      ) : null}
      {options.length > 0 ? (
        <RadioGroup
          className="flex flex-col gap-4"
          value={planTier}
          onValueChange={(value) => {
            if (value === "free" || value === "paid") {
              setPlanTier(value)
            }
          }}
        >
          {options.map((plan) => (
            <div
              key={plan.tier}
              className="flex flex-col gap-3 rounded-lg border p-4"
            >
              <div className="flex items-center gap-3">
                <RadioGroupItem
                  id={`onboarding-plan-${plan.tier}`}
                  value={plan.tier}
                />
                <Label
                  className="flex flex-1 cursor-pointer items-center justify-between gap-2 font-medium"
                  htmlFor={`onboarding-plan-${plan.tier}`}
                >
                  {plan.label}
                  {plan.isCurrent ? (
                    <Badge variant="secondary">
                      {t("billingCurrentPlanBadge")}
                    </Badge>
                  ) : null}
                </Label>
              </div>
              <dl className="grid gap-2 ps-8 text-sm text-muted-foreground">
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
            </div>
          ))}
        </RadioGroup>
      ) : null}
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <Button
        disabled={pending || planTier === ""}
        onClick={() => void onContinue()}
      >
        {t("continueToInvite")}
      </Button>
    </div>
  )
}
