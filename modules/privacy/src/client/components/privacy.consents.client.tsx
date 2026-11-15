"use client"

import { FieldKit } from "@features/form"
import { useShellNavigation } from "@features/shell"
import { serviceResponseFailureMessage } from "@modules/auth"
import type { PrivacyConsents } from "@modules/privacy/utils"
import { securityRpc } from "@modules/security/client"
import { authClient } from "@packages/better-auth/client"
import { useQuery, useQueryClient } from "@packages/react-query"
import { Skeleton } from "@packages/ui/components/skeleton"
import { toastManager } from "@packages/ui/components/toast"
import { BarChart3, MapPin, Megaphone } from "lucide-react"
import { useTranslations } from "next-intl"
import type { ReactNode } from "react"
import { useCallback, useMemo, useState } from "react"
import { z } from "zod"
import { PrivacyAccountFrame } from "./privacy.frame"

const toggleSchema = z.object({ enabled: z.boolean() })

function ConsentRow({
  description,
  disabled,
  enabled,
  icon,
  label,
  onToggle,
  title,
}: {
  readonly description: string
  readonly disabled?: boolean
  readonly enabled: boolean
  readonly icon: ReactNode
  readonly label: string
  readonly onToggle: (enabled: boolean) => void
  readonly title: string
}) {
  return (
    <div className="flex flex-wrap items-start gap-3 border-b pb-5 last:border-b-0">
      <div className="rounded-lg bg-muted p-2">{icon}</div>
      <div className="min-w-0 flex-1 space-y-1">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <FieldKit
        schema={toggleSchema}
        values={{ enabled }}
        onValuesChange={(next) => {
          if (typeof next.enabled !== "boolean" || next.enabled === enabled)
            return
          onToggle(next.enabled)
        }}
      >
        <FieldKit.Field
          type="switch"
          name="enabled"
          label={label}
          disabled={disabled}
        />
      </FieldKit>
    </div>
  )
}

export function PrivacyConsentsScreen() {
  const t = useTranslations("privacyConsents")
  const { Link } = useShellNavigation()
  const { data: session, isPending: sessionPending } = authClient.useSession()
  const queryClient = useQueryClient()
  const userId = session?.user.id
  const queryKey = useMemo(() => ["privacyConsents", userId] as const, [userId])
  const [busy, setBusy] = useState(false)

  const query = useQuery({
    queryKey,
    enabled: Boolean(userId),
    queryFn: async () => {
      const result = await securityRpc.security.privacy.consents.get()
      if (result.status !== "success") throw new Error(t("loadError"))
      return result.data
    },
  })

  const persist = useCallback(
    async (payload: Partial<PrivacyConsents>) => {
      setBusy(true)
      try {
        const result = await securityRpc.security.privacy.consents.update({
          payload: {
            ...(payload.marketingEmailEnabled !== undefined
              ? { marketingEmailEnabled: payload.marketingEmailEnabled }
              : {}),
            ...(payload.analyticsEnabled !== undefined
              ? { analyticsEnabled: payload.analyticsEnabled }
              : {}),
          },
        })
        if (result.status !== "success" || !result.data) {
          throw new Error(
            serviceResponseFailureMessage(result, {
              invalid: t("invalid"),
              fallback: t("saveError"),
            })
          )
        }
        queryClient.setQueryData(queryKey, result.data)
        toastManager.add({ title: t("saved"), type: "success" })
      } catch {
        toastManager.add({ title: t("saveError"), type: "error" })
        await query.refetch()
      } finally {
        setBusy(false)
      }
    },
    [query, queryClient, queryKey, t]
  )

  const consents = query.data

  if (sessionPending || (userId && query.isPending && !consents)) {
    return (
      <PrivacyAccountFrame
        activityTarget="account.privacy-data.consents"
        description={t("pageDescription")}
        title={t("pageTitle")}
      >
        <Skeleton className="h-40 w-full" />
      </PrivacyAccountFrame>
    )
  }

  if (!consents) {
    return (
      <PrivacyAccountFrame
        activityTarget="account.privacy-data.consents"
        description={t("pageDescription")}
        title={t("pageTitle")}
      >
        <p className="text-sm text-destructive" role="alert">
          {t("loadError")}
        </p>
      </PrivacyAccountFrame>
    )
  }

  return (
    <PrivacyAccountFrame
      activityTarget="account.privacy-data.consents"
      description={t("pageDescription")}
      title={t("pageTitle")}
    >
      <div className="space-y-5">
        <ConsentRow
          icon={<Megaphone className="size-4" aria-hidden />}
          title={t("marketingTitle")}
          description={t("marketingDescription")}
          label={t("marketingTitle")}
          enabled={consents.marketingEmailEnabled}
          disabled={busy}
          onToggle={(enabled) =>
            void persist({ marketingEmailEnabled: enabled })
          }
        />
        <ConsentRow
          icon={<BarChart3 className="size-4" aria-hidden />}
          title={t("analyticsTitle")}
          description={t("analyticsDescription")}
          label={t("analyticsTitle")}
          enabled={consents.analyticsEnabled}
          disabled={busy}
          onToggle={(enabled) => void persist({ analyticsEnabled: enabled })}
        />
        <div className="rounded-lg border bg-muted/40 p-4">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
            <div className="space-y-2 text-sm">
              <p className="font-medium">{t("locationTitle")}</p>
              <p className="text-muted-foreground">
                {t("locationDescription")}
              </p>
              <Link
                className="font-medium underline"
                href="/account/security/permissions"
              >
                {t("locationLink")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PrivacyAccountFrame>
  )
}
