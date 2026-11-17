import type { AuthOAuthCallbackFailureKind } from "./auth.oauth-callback-error"
import {
  authOAuthCallbackMessageKey,
  classifyAuthOAuthCallbackError,
} from "./auth.oauth-callback-error"

export type AuthErrorMessageKey =
  | (typeof authOAuthCallbackMessageKey)[AuthOAuthCallbackFailureKind]
  | "authErrorDescription"
  | "authErrorInvalidToken"
  | "authErrorExpiredToken"
  | "authErrorAccountDeleted"
  | "authErrorUserBanned"
  | "authErrorAccountNotLinked"
  | "authErrorEmailNotVerified"
  | "authErrorUnableToCreateUser"
  | "authErrorRateLimited"
  | "authErrorProviderNotConfigured"
  | "authErrorServiceUnavailable"
  | "socialSignInFailed"

const INVALID_TOKEN = new Set([
  "invalid_token",
  "token_invalid",
  "invalidtoken",
])

const EXPIRED_TOKEN = new Set([
  "expired_token",
  "token_expired",
  "tokenexpired",
])

const ACCOUNT_DELETED = new Set(["account_deleted"])

const USER_BANNED = new Set([
  "user_banned",
  "banned",
  "user_is_banned",
  "account_banned",
])

const ACCOUNT_NOT_LINKED = new Set([
  "account_not_linked",
  "credential_account_not_found",
  "social_account_not_linked",
])

const EMAIL_NOT_VERIFIED = new Set(["email_not_verified"])

const UNABLE_TO_CREATE_USER = new Set([
  "unable_to_create_user",
  "failed_to_create_user",
])

const RATE_LIMITED = new Set([
  "rate_limit_exceeded",
  "too_many_requests",
  "rate_limited",
])

function normalizeAuthErrorCode(error: string | null | undefined): string {
  return error?.trim().toLowerCase().replace(/\s+/g, "_") ?? ""
}

export function resolveAuthErrorMessageKey(
  error: string | null | undefined,
  options?: { readonly provider?: "github" | "google" }
): AuthErrorMessageKey {
  const code = normalizeAuthErrorCode(error)
  if (!code) return "authErrorDescription"

  const oauthKind = classifyAuthOAuthCallbackError(error)
  if (
    oauthKind !== "provider" ||
    OAUTH_ONLY_CODES.has(code) ||
    code.startsWith("state_")
  ) {
    if (oauthKind !== "provider") {
      return authOAuthCallbackMessageKey[oauthKind]
    }
  }

  if (INVALID_TOKEN.has(code)) return "authErrorInvalidToken"
  if (EXPIRED_TOKEN.has(code)) return "authErrorExpiredToken"
  if (ACCOUNT_DELETED.has(code)) return "authErrorAccountDeleted"
  if (USER_BANNED.has(code)) return "authErrorUserBanned"
  if (ACCOUNT_NOT_LINKED.has(code)) return "authErrorAccountNotLinked"
  if (EMAIL_NOT_VERIFIED.has(code)) return "authErrorEmailNotVerified"
  if (UNABLE_TO_CREATE_USER.has(code)) return "authErrorUnableToCreateUser"
  if (RATE_LIMITED.has(code) || code === "429") return "authErrorRateLimited"
  if (code === "provider_not_found" && options?.provider) {
    return "authErrorProviderNotConfigured"
  }
  if (code === "not_found" && !options?.provider) {
    return "authErrorServiceUnavailable"
  }

  const oauth = classifyAuthOAuthCallbackError(error)
  if (oauth !== "provider") return authOAuthCallbackMessageKey[oauth]
  return "authErrorDescription"
}

const OAUTH_ONLY_CODES = new Set([
  "login_cancelled",
  "user_cancelled",
  "access_denied",
  "state_expired",
  "state_invalid",
  "state_mismatch",
  "state_not_found",
  "state_security_mismatch",
])
