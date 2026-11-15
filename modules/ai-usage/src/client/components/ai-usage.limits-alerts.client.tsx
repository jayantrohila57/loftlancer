"use client"

import { FieldKit } from "@features/form"
import {
  useOrgSessionActiveId,
  useOrgSessionActiveIdPending,
} from "@modules/org"
import { Button } from "@packages/ui/components/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@packages/ui/components/empty"
import { Input } from "@packages/ui/components/input"
import { Skeleton } from "@packages/ui/components/skeleton"
import { Switch } from "@packages/ui/components/switch"
import { toastManager } from "@packages/ui/components/toast"
import { Bell, Sparkles } from "lucide-react"
import { useTranslations } from "next-intl"
import { useCallback, useState } from "react"
import { z } from "zod"

import { useAiUsageApi } from "../hooks/ai-usage.api"

const toggleSchema = z.object({ enabled: z.boolean() })

function ThresholdRow({
  description,
  disabled,
  enabled,
  label,
  onToggle,
  readOnly,
  title,
}: {
  readonly description: string
  readonly disabled?: boolean
  readonly enabled: boolean
  readonly label: string
  readonly onToggle?: (enabled: boolean) => void
  readonly readOnly?: boolean
  readonly title: string
}) {
  return (
    <div className="flex flex-wrap items-start gap-3 border-b pb-5 last:border-b-0">
      <div className="min-w-0 flex-1 space-y-1">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="w-auto shrink-0">
        {readOnly ? (
          <Switch checked={enabled} disabled aria-label={label} />
        ) : (
          <FieldKit
            schema={toggleSchema}
            values={{ enabled }}
            onValuesChange={(next) => {
              if (typeof next.enabled !== "boolean" || next.enabled === enabled)
                return
              onToggle?.(next.enabled)
            }}
          >
            <FieldKit.Field
              type="switch"
              name="enabled"
              label={label}
              disabled={disabled}
            />
          </FieldKit>
        )}
      </div>
    </div>
  )
}

function AiUsageLimitsSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-4 w-full max-w-lg" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
    </div>
  )
}

export function AiUsageLimitsAlertsScreen() {
  const t = useTranslations("ui")
  const orgResolving = useOrgSessionActiveIdPending()
  const organizationId = useOrgSessionActiveId()
  const limits = useAiUsageApi.useLimitsAlerts(organizationId)
  const update = useAiUsageApi.useLimitsAlertsUpdate(organizationId)
  const [busy, setBusy] = useState(false)
  const [capDraft, setCapDraft] = useState<string>("")

  const persist = useCallback(
    async (patch: Parameters<typeof update.mutateAsync>[0]) => {
      setBusy(true)
      try {
        await toastManager.promise(update.mutateAsync(patch), {
          loading: t("aiUsageLimitsSaving"),
          success: t("aiUsageLimitsSaved"),
          error: (error) =>
            error instanceof Error
              ? error.message
              : t("aiUsageLimitsSaveError"),
        })
      } catch {
        /* Toast reports failure. */
      } finally {
        setBusy(false)
      }
    },
    [t, update]
  )

  if (orgResolving) return <AiUsageLimitsSkeleton />

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
      </Empty>
    )
  }

  if (limits.isPending) return <AiUsageLimitsSkeleton />

  if (limits.isError || !limits.data) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        {t("aiUsageLimitsLoadError")}
      </p>
    )
  }

  const data = limits.data
  const readOnly = !data.isOrgOwner
  const deliveryNote = data.emailDeliveryAvailable
    ? t("aiUsageLimitsEmailDeliveryOn")
    : t("aiUsageLimitsEmailDeliveryOff")
  const capValue =
    capDraft ||
    (data.monthlySpendCapCredits !== null
      ? String(data.monthlySpendCapCredits)
      : "100")

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground" role="status">
        {t("aiUsageLimitsAlertsDescription")}
      </p>
      <p className="text-sm text-muted-foreground" role="status">
        {deliveryNote}
      </p>
      {readOnly ? (
        <p className="text-sm text-muted-foreground" role="status">
          {t("aiUsageLimitsReadOnlyMember")}
        </p>
      ) : null}

      <ThresholdRow
        title={data.presetLabels.lowBalance}
        description={t("aiUsageLimitsLowBalanceHelp")}
        enabled={data.alertLowBalanceEnabled}
        label={t("aiUsageLimitsLowBalanceLabel")}
        readOnly={readOnly}
        disabled={busy || update.isPending}
        onToggle={(enabled) =>
          void persist({ alertLowBalanceEnabled: enabled })
        }
      />
      <ThresholdRow
        title={data.presetLabels.veryLowBalance}
        description={t("aiUsageLimitsVeryLowBalanceHelp")}
        enabled={data.alertVeryLowBalanceEnabled}
        label={t("aiUsageLimitsVeryLowBalanceLabel")}
        readOnly={readOnly}
        disabled={busy || update.isPending}
        onToggle={(enabled) =>
          void persist({ alertVeryLowBalanceEnabled: enabled })
        }
      />
      <ThresholdRow
        title={data.presetLabels.depleted}
        description={t("aiUsageLimitsDepletedHelp")}
        enabled={data.alertDepletedEnabled}
        label={t("aiUsageLimitsDepletedLabel")}
        readOnly={readOnly}
        disabled={busy || update.isPending}
        onToggle={(enabled) => void persist({ alertDepletedEnabled: enabled })}
      />

      <div className="space-y-3 rounded-lg border p-4">
        <div className="flex items-center gap-2">
          <Bell className="size-4 text-muted-foreground" aria-hidden />
          <p className="font-medium">{t("aiUsageLimitsMonthlyCapTitle")}</p>
        </div>
        <p className="text-sm text-muted-foreground">
          {t("aiUsageLimitsMonthlyCapDescription")}
        </p>
        <ThresholdRow
          title={t("aiUsageLimitsMonthlyCapToggle")}
          description={t("aiUsageLimitsMonthlyCapToggleHelp")}
          enabled={data.monthlySpendCapEnabled}
          label={t("aiUsageLimitsMonthlyCapToggle")}
          readOnly={readOnly}
          disabled={busy || update.isPending}
          onToggle={(enabled) =>
            void persist({
              monthlySpendCapEnabled: enabled,
              monthlySpendCapCredits: enabled
                ? Number.parseInt(capValue, 10) || 100
                : null,
            })
          }
        />
        {data.monthlySpendCapEnabled ? (
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="ai-monthly-cap">
              {t("aiUsageLimitsMonthlyCapCredits")}
            </label>
            <Input
              id="ai-monthly-cap"
              type="number"
              min={1}
              disabled={readOnly || busy || update.isPending}
              value={capValue}
              onChange={(event) => setCapDraft(event.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              {t("aiUsageLimitsMonthlyCapCreditsHelp")}
            </p>
            {!readOnly ? (
              <Button
                type="button"
                disabled={busy || update.isPending}
                onClick={() => {
                  const cap = Number.parseInt(capValue, 10)
                  if (!Number.isFinite(cap) || cap < 1) return
                  void persist({
                    monthlySpendCapEnabled: true,
                    monthlySpendCapCredits: cap,
                  })
                }}
              >
                {t("submit")}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
