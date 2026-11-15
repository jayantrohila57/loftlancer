"use client"

import { useQueryClient } from "@packages/react-query"
import { useSearchParams } from "next/navigation"
import { useEffect, useRef } from "react"
import { parseBillingPortalReturn } from "../../utils/billing.external-return"
import {
  consumeBillingPortalLaunchPending,
  markBillingPortalLaunch,
} from "../../utils/billing.portal-return"
import { invalidateBillingSubscriptionQueries } from "./billing.hook.subscription-cache"
import { billingProfileKey } from "./billing.hooks.keys"

export { markBillingPortalLaunch }

export function useBillingPortalReturnRefresh(
  organizationId: string | null | undefined
) {
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const refreshed = useRef(false)

  useEffect(() => {
    async function refreshBillingAfterReturn() {
      if (refreshed.current || !organizationId) return
      const explicitReturn = parseBillingPortalReturn(searchParams)
      const pendingPortal = consumeBillingPortalLaunchPending()
      if (!explicitReturn && !pendingPortal) return

      refreshed.current = true
      await invalidateBillingSubscriptionQueries(queryClient, organizationId)
      await queryClient.invalidateQueries({
        queryKey: billingProfileKey(organizationId),
      })
    }

    void refreshBillingAfterReturn()

    function onVisibilityChange() {
      if (document.visibilityState !== "visible") return
      refreshed.current = false
      void refreshBillingAfterReturn()
    }

    document.addEventListener("visibilitychange", onVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange)
    }
  }, [organizationId, queryClient, searchParams])
}
