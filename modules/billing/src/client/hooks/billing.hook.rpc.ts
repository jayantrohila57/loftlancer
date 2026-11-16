"use client"

import { TransientClientError, withClientRetry } from "@modules/auth"

import {
  BillingClientError,
  mapBillingRpcThrownError,
} from "../../utils/billing.client-error"

const BILLING_TRANSIENT_ENVELOPE_CODES = new Set([
  "billing.entitlement_missing",
  "auth.no_active_org",
  "rbac.not_member",
  "rbac.org_owner_required",
  "rbac.forbidden",
  "billing.customer_unbound",
])

export async function callBillingRpc<Data>(
  invoke: () => Promise<{
    status: string
    message: string
    data?: Data | null
    error?: { code?: string }
  }>
): Promise<NonNullable<Data>> {
  return withClientRetry(async () => {
    let response: Awaited<ReturnType<typeof invoke>>
    try {
      response = await invoke()
    } catch (error) {
      mapBillingRpcThrownError(error)
    }
    if (response.status === "error") {
      const code = response.error?.code ?? "billing.unavailable"
      if (BILLING_TRANSIENT_ENVELOPE_CODES.has(code)) {
        throw new TransientClientError(
          response.message,
          response.error ?? { code }
        )
      }
      throw new BillingClientError(response.message, code)
    }
    if (response.status === "failed") {
      const code = response.error?.code ?? "billing.unavailable"
      if (BILLING_TRANSIENT_ENVELOPE_CODES.has(code)) {
        throw new TransientClientError(
          response.message,
          response.error ?? { code }
        )
      }
      throw new BillingClientError(response.message, code)
    }
    if (response.data == null) {
      throw new Error(response.message)
    }
    return response.data
  })
}
