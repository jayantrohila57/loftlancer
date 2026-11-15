"use client"

import {
  TransientClientError,
  withClientRetry,
} from "@modules/auth/utils/auth.client-retry"

export function isTransientSecurityRpcCode(code: string | undefined): boolean {
  return (
    code === "SERVICE_UNAVAILABLE" ||
    code === "ACTIVITY_UNAVAILABLE" ||
    code === "LOCATION_UNAVAILABLE" ||
    code === "PREFERENCES_UNAVAILABLE" ||
    code === "SESSIONS_UNAVAILABLE" ||
    code === "SIGN_IN_METHODS_UNAVAILABLE"
  )
}

type SecurityServiceResponse = {
  readonly status: string
  readonly message: string
  readonly data?: unknown
  readonly error?: { readonly code?: string }
}

export async function callSecurityRpc<Data>(
  invoke: () => Promise<SecurityServiceResponse & { data?: Data | null }>
): Promise<NonNullable<Data>> {
  return withClientRetry(async () => {
    const response = await invoke()
    if (response.status === "error") {
      const code = response.error?.code
      if (isTransientSecurityRpcCode(code)) {
        throw new TransientClientError(
          response.message,
          response.error ?? { code: code ?? "SERVICE_UNAVAILABLE" }
        )
      }
      throw new Error(response.message)
    }
    if (response.status === "failed" || response.data == null) {
      throw new Error(response.message)
    }
    return response.data
  })
}

/**
 * Retries only when the server reports a transient unavailable error.
 * Use for mutations that are safe to repeat (e.g. activity history clear).
 */
export async function invokeIdempotentSecurityMutation<
  Response extends SecurityServiceResponse,
>(invoke: () => Promise<Response>): Promise<Response> {
  return withClientRetry(async () => {
    const response = await invoke()
    if (response.status === "error") {
      const code = response.error?.code
      if (isTransientSecurityRpcCode(code)) {
        throw new TransientClientError(
          response.message,
          response.error ?? { code: code ?? "SERVICE_UNAVAILABLE" }
        )
      }
    }
    return response
  })
}
