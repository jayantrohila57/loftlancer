"use client"

import { useTranslations } from "next-intl"
import { useCallback, useState } from "react"

import { useBillingApi } from "./billing.api"
import { useBillingOrgManageQueryEnabled } from "./billing.hook.query-enabled"
import { useInvalidateBillingSubscriptionQueries } from "./billing.hook.subscription-cache"

export function useBillingPlanActions(
  organizationId: string | null | undefined
) {
  const t = useTranslations("ui")
  const canManage = useBillingOrgManageQueryEnabled()
  const invalidateSubscriptionQueries =
    useInvalidateBillingSubscriptionQueries(organizationId)
  const [actionKey, setActionKey] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const actionPending = actionKey !== null

  const runCheckoutAction = useCallback(
    async (
      key: string,
      action: () => Promise<{ paymentUrl?: string | null }>
    ) => {
      if (actionPending || !canManage) return
      setActionError(null)
      setActionKey(key)
      try {
        const result = await action()
        if (result.paymentUrl) {
          window.location.assign(result.paymentUrl)
          return
        }
        await invalidateSubscriptionQueries()
      } catch (error) {
        setActionError(
          error instanceof Error ? error.message : t("operationFailed")
        )
        setActionKey(null)
      }
    },
    [actionPending, canManage, invalidateSubscriptionQueries, t]
  )

  const onUpgrade = useCallback(
    () => runCheckoutAction("upgrade", () => useBillingApi.postUpgrade()),
    [runCheckoutAction]
  )

  const onDowngrade = useCallback(
    () => runCheckoutAction("downgrade", () => useBillingApi.postDowngrade()),
    [runCheckoutAction]
  )

  const onCancel = useCallback(async () => {
    if (actionPending || !canManage) return
    setActionError(null)
    setActionKey("cancel")
    try {
      await useBillingApi.postCancel()
      await invalidateSubscriptionQueries()
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : t("operationFailed")
      )
    } finally {
      setActionKey(null)
    }
  }, [actionPending, canManage, invalidateSubscriptionQueries, t])

  return {
    actionPending,
    actionKey,
    actionError,
    canManage,
    onUpgrade,
    onDowngrade,
    onCancel,
  }
}
