"use client"

import { FieldKit } from "@features/form"
import { serviceResponseFailureMessage } from "@modules/auth"
import type { NotificationPreferences } from "@modules/notifications/utils"
import { securityRpc } from "@modules/security/client"
import { authClient } from "@packages/better-auth/client"
import { useQuery, useQueryClient } from "@packages/react-query"
import { Skeleton } from "@packages/ui/components/skeleton"
import { Switch } from "@packages/ui/components/switch"
import { toastManager } from "@packages/ui/components/toast"
import {
  Bell,
  Building2,
  CreditCard,
  Megaphone,
  ShieldCheck,
} from "lucide-react"
import { useTranslations } from "next-intl"
import type { ReactNode } from "react"
import { useCallback, useMemo, useState } from "react"
import { z } from "zod"
import { NotificationPreferencesFrame } from "./notifications.frame"

const toggleSchema = z.object({ enabled: z.boolean() })

function CategoryRow({
  description,
  disabled,
  enabled,
  icon,
  label,
  onToggle,
  readOnly,
  title,
}: {
  readonly description: string
  readonly disabled?: boolean
  readonly enabled: boolean
  readonly icon: ReactNode
  readonly label: string
  readonly onToggle?: (enabled: boolean) => void
  readonly readOnly?: boolean
  readonly title: string
}) {
  return (
    <div className="flex flex-wrap items-start gap-3 border-b pb-5 last:border-b-0">
      <div className="rounded-lg bg-muted p-2">{icon}</div>
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

export function AccountNotificationPreferencesScreen() {
  const t = useTranslations("notifications")
  const { data: session, isPending: sessionPending } = authClient.useSession()
  const queryClient = useQueryClient()
  const userId = session?.user.id
  const queryKey = useMemo(
    () => ["notificationPreferences", userId] as const,
    [userId]
  )
  const [busy, setBusy] = useState(false)

  const query = useQuery({
    queryKey,
    enabled: Boolean(userId),
    queryFn: async () => {
      const result = await securityRpc.security.notifications.preferences.get()
      if (result.status !== "success") throw new Error(t("loadError"))
      return result.data
    },
  })

  const persist = useCallback(
    async (payload: Partial<NotificationPreferences>) => {
      setBusy(true)
      try {
        const result =
          await securityRpc.security.notifications.preferences.update({
            payload: {
              ...(payload.billingEmailEnabled !== undefined
                ? { billingEmailEnabled: payload.billingEmailEnabled }
                : {}),
              ...(payload.organizationInvitesEnabled !== undefined
                ? {
                    organizationInvitesEnabled:
                      payload.organizationInvitesEnabled,
                  }
                : {}),
              ...(payload.productEmailEnabled !== undefined
                ? { productEmailEnabled: payload.productEmailEnabled }
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
        return result.data
      } catch {
        toastManager.add({ title: t("saveError"), type: "error" })
        await query.refetch()
      } finally {
        setBusy(false)
      }
    },
    [query, queryClient, queryKey, t]
  )

  const prefs = query.data

  if (sessionPending || (userId && query.isPending && !prefs)) {
    return (
      <NotificationPreferencesFrame
        description={t("pageDescription")}
        title={t("pageTitle")}
      >
        <Skeleton className="h-40 w-full" />
      </NotificationPreferencesFrame>
    )
  }

  if (!prefs) {
    return (
      <NotificationPreferencesFrame
        description={t("pageDescription")}
        title={t("pageTitle")}
      >
        <p className="text-sm text-destructive" role="alert">
          {t("loadError")}
        </p>
      </NotificationPreferencesFrame>
    )
  }

  return (
    <NotificationPreferencesFrame
      description={t("pageDescription")}
      title={t("pageTitle")}
    >
      <div className="space-y-5">
        <CategoryRow
          icon={<ShieldCheck className="size-4" aria-hidden />}
          title={t("securityTitle")}
          description={t("securityDescription")}
          label={t("securityTitle")}
          enabled
          readOnly
        />
        <CategoryRow
          icon={<CreditCard className="size-4" aria-hidden />}
          title={t("billingTitle")}
          description={
            prefs.isOrgOwner
              ? t("billingOwnerDescription")
              : t("billingMemberDescription")
          }
          label={t("billingTitle")}
          enabled={prefs.billingEmailEnabled}
          disabled={busy || !prefs.isOrgOwner}
          onToggle={(enabled) => void persist({ billingEmailEnabled: enabled })}
        />
        <CategoryRow
          icon={<Building2 className="size-4" aria-hidden />}
          title={t("organizationTitle")}
          description={t("organizationDescription")}
          label={t("organizationTitle")}
          enabled={prefs.organizationInvitesEnabled}
          disabled={busy}
          onToggle={(enabled) =>
            void persist({ organizationInvitesEnabled: enabled })
          }
        />
        <CategoryRow
          icon={<Megaphone className="size-4" aria-hidden />}
          title={t("productTitle")}
          description={t("productDescription")}
          label={t("productTitle")}
          enabled={prefs.productEmailEnabled}
          disabled={busy}
          onToggle={(enabled) => void persist({ productEmailEnabled: enabled })}
        />
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Bell className="size-4 shrink-0" aria-hidden />
          {t("emailOnlyFootnote")}
        </p>
      </div>
    </NotificationPreferencesFrame>
  )
}
