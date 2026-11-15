type OrgClientFailure = {
  readonly code?: string
  readonly message?: string
}

const ORG_SLUG_TAKEN_CODES = new Set([
  "ORGANIZATION_ALREADY_EXISTS",
  "ORGANIZATION_SLUG_ALREADY_TAKEN",
])

const ORG_SLUG_TAKEN_MESSAGES = new Set([
  "Organization already exists",
  "Organization slug already taken",
])

export function formatOrgClientError(
  error: OrgClientFailure | null | undefined,
  input: {
    readonly fallback: string
    readonly limitMessage: string
    readonly slugTakenMessage: string
  }
): string {
  const message = error?.message?.trim()
  if (
    error?.code === "ENTITLEMENT_ORG_LIMIT" ||
    message === "entitlement.org_limit"
  ) {
    return input.limitMessage
  }
  if (
    (error?.code && ORG_SLUG_TAKEN_CODES.has(error.code)) ||
    (message && ORG_SLUG_TAKEN_MESSAGES.has(message))
  ) {
    return input.slugTakenMessage
  }
  if (message) return message
  return input.fallback
}
