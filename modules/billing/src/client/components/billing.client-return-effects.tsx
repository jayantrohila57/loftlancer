"use client"

import { useOrgSessionActiveId } from "@modules/org"

import { useBillingPortalReturnRefresh } from "../hooks/billing.hook.portal-return-refresh"
import { BillingPaymentSetupReturnFeedback } from "./billing.payment-setup-return-feedback.client"

/** Toasts and cache refresh after Autumn payment setup or portal return. */
export function BillingClientReturnEffects() {
  const organizationId = useOrgSessionActiveId()
  useBillingPortalReturnRefresh(organizationId)
  return <BillingPaymentSetupReturnFeedback />
}
