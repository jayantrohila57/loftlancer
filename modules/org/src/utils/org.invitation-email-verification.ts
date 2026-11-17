type InvitationClientError = {
  readonly code?: string
  readonly message?: string
}

const INVITATION_VERIFY_EMAIL_CODES = new Set([
  "EMAIL_VERIFICATION_REQUIRED_BEFORE_ACCEPTING_OR_REJECTING_INVITATION",
  "EMAIL_VERIFICATION_REQUIRED_FOR_INVITATION",
])

export function isOrgInvitationEmailVerificationError(
  error: InvitationClientError | null | undefined
): boolean {
  if (!error?.code) return false
  return INVITATION_VERIFY_EMAIL_CODES.has(error.code)
}
