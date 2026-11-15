import { isTransientError, TransientClientError } from "@modules/auth"

export class BillingClientError extends Error {
  override readonly name = "BillingClientError"

  constructor(
    message: string,
    readonly code: string
  ) {
    super(message)
  }
}

const BILLING_TRANSIENT_DOMAIN_CODES = new Set([
  "billing.entitlement_missing",
  "auth.no_active_org",
  "rbac.not_member",
  "rbac.org_owner_required",
])

const BILLING_NON_RETRYABLE_DOMAIN_CODES = new Set([
  "billing.autumn_unconfigured",
  "billing.customer_unbound",
])

type OrpcDefinedError = {
  message: string
  domainCode?: string
  orpcCode: string
}

function isOrpcThrownError(
  error: Error & { code?: string; status?: number; defined?: boolean }
): boolean {
  if (typeof error.code !== "string") return false
  return (
    error.defined === true ||
    error.name === "ORPCError" ||
    typeof error.status === "number"
  )
}

/** Reads domain `data.code` from an oRPC client error thrown by securityRpc. */
export function readOrpcDefinedError(error: unknown): OrpcDefinedError | null {
  if (!(error instanceof Error)) return null
  const candidate = error as Error & {
    defined?: boolean
    code?: string
    status?: number
    data?: unknown
  }
  if (!isOrpcThrownError(candidate)) return null
  let domainCode: string | undefined
  if (
    candidate.data &&
    typeof candidate.data === "object" &&
    "code" in candidate.data
  ) {
    const value = (candidate.data as { code?: unknown }).code
    if (typeof value === "string") domainCode = value
  }
  return {
    message: candidate.message.trim() || "Billing request failed.",
    domainCode,
    orpcCode: candidate.code ?? "UNKNOWN",
  }
}

export function mapBillingRpcThrownError(error: unknown): never {
  const parsed = readOrpcDefinedError(error)
  if (!parsed) {
    throw error instanceof Error ? error : new Error("Billing request failed.")
  }
  const { message, domainCode, orpcCode } = parsed
  const code = domainCode ?? orpcCode

  if (BILLING_TRANSIENT_DOMAIN_CODES.has(code)) {
    throw new TransientClientError(message, { code })
  }

  if (domainCode?.startsWith("billing.")) {
    throw new BillingClientError(message, domainCode)
  }

  if (orpcCode === "SERVICE_UNAVAILABLE") {
    throw new TransientClientError(message, { code: orpcCode })
  }

  throw new BillingClientError(message, code)
}

export function readBillingClientErrorCode(error: unknown): string | undefined {
  if (error instanceof BillingClientError) return error.code
  if (error instanceof TransientClientError) {
    const detail = error.detail
    if (detail && typeof detail === "object" && "code" in detail) {
      const code = detail.code
      if (typeof code === "string") return code
    }
  }
  const orpc = readOrpcDefinedError(error)
  if (orpc?.domainCode?.startsWith("billing.")) return orpc.domainCode
  return undefined
}

export function isBillingQueryRetryable(error: unknown): boolean {
  if (isTransientError(error)) return true
  const code = readBillingClientErrorCode(error)
  if (!code || BILLING_NON_RETRYABLE_DOMAIN_CODES.has(code)) return false
  if (
    code === "billing.invoices_failed" ||
    code === "billing.customer_profile_failed"
  ) {
    return true
  }
  return false
}
