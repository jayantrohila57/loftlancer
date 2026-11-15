export type AuthOAuthCallbackFailureKind =
  | "cancelled"
  | "denied"
  | "expired"
  | "provider"

const OAUTH_SIGN_IN_CANCELLED = new Set(["login_cancelled", "user_cancelled"])
const OAUTH_SIGN_IN_DENIED = new Set(["access_denied"])
const OAUTH_SIGN_IN_EXPIRED = new Set([
  "state_expired",
  "state_invalid",
  "state_mismatch",
  "state_not_found",
  "state_security_mismatch",
])

export function classifyAuthOAuthCallbackError(
  error: string | null | undefined
): AuthOAuthCallbackFailureKind {
  if (!error?.trim()) return "provider"
  const code = error.trim().toLowerCase()
  if (OAUTH_SIGN_IN_CANCELLED.has(code)) return "cancelled"
  if (OAUTH_SIGN_IN_DENIED.has(code)) return "denied"
  if (OAUTH_SIGN_IN_EXPIRED.has(code)) return "expired"
  return "provider"
}

export const authOAuthCallbackMessageKey = {
  cancelled: "socialSignInCancelled",
  denied: "socialSignInDenied",
  expired: "socialSignInExpired",
  provider: "socialSignInProviderError",
} as const satisfies Record<AuthOAuthCallbackFailureKind, string>
