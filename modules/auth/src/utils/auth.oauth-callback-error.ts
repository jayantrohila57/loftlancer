export type AuthOAuthCallbackFailureKind =
  | "cancelled"
  | "denied"
  | "expired"
  | "provider"
  | "accountNotLinked"
  | "emailNotVerified"
  | "disposableEmail"

const OAUTH_SIGN_IN_CANCELLED = new Set(["login_cancelled", "user_cancelled"])
const OAUTH_SIGN_IN_DENIED = new Set(["access_denied"])
const OAUTH_SIGN_IN_EXPIRED = new Set([
  "state_expired",
  "state_invalid",
  "state_mismatch",
  "state_not_found",
  "state_security_mismatch",
  "token_expired",
  "invalid_token",
])
const ACCOUNT_NOT_LINKED = new Set([
  "account_not_linked",
  "oauth_link_error",
  "unable_to_link_account",
])
const EMAIL_NOT_VERIFIED = new Set(["email_not_verified"])
const DISPOSABLE_EMAIL = new Set(["disposable_email"])

export function classifyAuthOAuthCallbackError(
  error: string | null | undefined
): AuthOAuthCallbackFailureKind {
  if (!error?.trim()) return "provider"
  const code = error.trim().toLowerCase()
  if (OAUTH_SIGN_IN_CANCELLED.has(code)) return "cancelled"
  if (OAUTH_SIGN_IN_DENIED.has(code)) return "denied"
  if (OAUTH_SIGN_IN_EXPIRED.has(code)) return "expired"
  if (ACCOUNT_NOT_LINKED.has(code)) return "accountNotLinked"
  if (EMAIL_NOT_VERIFIED.has(code)) return "emailNotVerified"
  if (DISPOSABLE_EMAIL.has(code)) return "disposableEmail"
  return "provider"
}

export const authOAuthCallbackMessageKey = {
  cancelled: "socialSignInCancelled",
  denied: "socialSignInDenied",
  expired: "socialSignInExpired",
  provider: "socialSignInProviderError",
  accountNotLinked: "socialSignInAccountNotLinked",
  emailNotVerified: "socialSignInEmailNotVerified",
  disposableEmail: "disposableEmailNotAllowed",
} as const satisfies Record<AuthOAuthCallbackFailureKind, string>
