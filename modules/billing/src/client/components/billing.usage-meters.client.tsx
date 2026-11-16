"use client"

import { formatStorageBytes } from "@modules/storage/utils/storage.format-bytes"
import { useTranslations } from "next-intl"

type UsageMeter = {
  readonly id: string
  readonly label: string
  readonly usedLabel: string
  readonly includedLabel: string
  readonly used: number
  readonly included: number
}

function warningFor(used: number, included: number) {
  if (included <= 0) return used > 0 ? "exhausted" : "none"
  if (used >= included) return "exhausted"
  if (used / included >= 0.8) return "approaching"
  return "none"
}

export function BillingUsageMeters(props: {
  readonly usedBytes: number
  readonly quotaBytes: number
  readonly aiCreditBalance: number
  readonly aiCreditsIncluded: number
}) {
  const t = useTranslations("ui")
  const aiUsed = Math.max(0, props.aiCreditsIncluded - props.aiCreditBalance)
  const meters: readonly UsageMeter[] = [
    {
      id: "storage",
      label: t("billingUsageStorage"),
      usedLabel: formatStorageBytes(props.usedBytes),
      includedLabel: formatStorageBytes(props.quotaBytes),
      used: props.usedBytes,
      included: props.quotaBytes,
    },
    {
      id: "ai",
      label: t("billingUsageAiCredits"),
      usedLabel: String(aiUsed),
      includedLabel: String(props.aiCreditsIncluded),
      used: aiUsed,
      included: props.aiCreditsIncluded,
    },
  ]

  return (
    <div className="flex flex-col gap-3">
      {meters.map((meter) => {
        const ratio =
          meter.included > 0
            ? Math.min(100, (meter.used / meter.included) * 100)
            : meter.used > 0
              ? 100
              : 0
        const warning = warningFor(meter.used, meter.included)
        return (
          <div key={meter.id} className="flex flex-col gap-1">
            <div className="flex justify-between gap-2 text-sm">
              <span>{meter.label}</span>
              <span className="text-muted-foreground tabular-nums">
                {t("billingUsageFraction", {
                  used: meter.usedLabel,
                  included: meter.includedLabel,
                })}
              </span>
            </div>
            <div
              aria-hidden="true"
              className="h-2 overflow-hidden rounded-full bg-muted"
            >
              <div
                className={
                  warning === "exhausted"
                    ? "h-full bg-destructive"
                    : warning === "approaching"
                      ? "h-full bg-amber-500"
                      : "h-full bg-primary"
                }
                style={{ width: `${ratio}%` }}
              />
            </div>
            {warning === "approaching" ? (
              <p
                className="text-sm text-amber-600 dark:text-amber-500"
                role="status"
              >
                {t("billingUsageApproaching")}
              </p>
            ) : null}
            {warning === "exhausted" ? (
              <p className="text-sm text-destructive" role="status">
                {t("billingUsageExhausted")}
              </p>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
