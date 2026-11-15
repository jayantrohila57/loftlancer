"use client"

import { useOrgSessionActiveId } from "@modules/org"
import { useQueryClient } from "@packages/react-query"
import { toastManager } from "@packages/ui/components/toast"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { useEffect, useRef } from "react"

import {
  billingPaymentSetupReturnMessageKey,
  billingPaymentSetupReturnToastType,
  parseBillingPaymentSetupReturn,
  stripBillingPaymentSetupReturnParams,
} from "../../utils/billing.external-return"
import { billingProfileKey } from "../hooks/billing.hooks.keys"

export function BillingPaymentSetupReturnFeedback() {
  const t = useTranslations("ui")
  const searchParams = useSearchParams()
  const organizationId = useOrgSessionActiveId()
  const queryClient = useQueryClient()
  const handled = useRef<string | null>(null)

  useEffect(() => {
    const kind = parseBillingPaymentSetupReturn(searchParams)
    if (!kind) return

    const signature = `${kind}:${searchParams.toString()}`
    if (handled.current === signature) return
    handled.current = signature

    const messageKey = billingPaymentSetupReturnMessageKey[kind]
    toastManager.add({
      title: t(messageKey),
      type: billingPaymentSetupReturnToastType[kind],
    })

    if (kind === "success") {
      void queryClient.invalidateQueries({
        queryKey: billingProfileKey(organizationId),
      })
    }

    const url = new URL(window.location.href)
    stripBillingPaymentSetupReturnParams(url)
    window.history.replaceState(window.history.state, "", url.toString())
  }, [organizationId, queryClient, searchParams, t])

  return null
}
