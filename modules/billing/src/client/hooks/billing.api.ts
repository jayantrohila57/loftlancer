"use client"

import { TransientClientError, withClientRetry } from "@modules/auth"
import { securityRpc } from "@modules/security/client"

import type {
  BillingCancelData,
  BillingDowngradeData,
  BillingSetupPaymentData,
  BillingUpgradeData,
} from "../../utils/types/billing.types.rpc"
import { useBillingOverview } from "./billing.hook.overview"
import { callBillingRpc } from "./billing.hook.rpc"

async function postUpgrade(): Promise<BillingUpgradeData> {
  return callBillingRpc<BillingUpgradeData>(() =>
    securityRpc.security.billing.beginUpgrade()
  )
}

async function postPortal() {
  return withClientRetry(async () => {
    const response = await securityRpc.security.billing.openPortal()
    if (response.status === "error") {
      throw new TransientClientError(response.message, response.error)
    }
    if (response.status !== "success" || !response.data) {
      throw new Error(response.message)
    }
    return response.data
  })
}

async function postDowngrade(): Promise<BillingDowngradeData> {
  return callBillingRpc<BillingDowngradeData>(() =>
    securityRpc.security.billing.beginDowngrade()
  )
}

async function postCancel(): Promise<BillingCancelData> {
  return callBillingRpc<BillingCancelData>(() =>
    securityRpc.security.billing.beginCancel()
  )
}

async function postSetupPayment(): Promise<BillingSetupPaymentData> {
  return callBillingRpc<BillingSetupPaymentData>(() =>
    securityRpc.security.billing.setupPayment()
  )
}

export const useBillingApi = {
  useOverview: useBillingOverview,
  postUpgrade,
  postDowngrade,
  postCancel,
  postPortal,
  postSetupPayment,
}
