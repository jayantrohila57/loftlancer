import type { AuthOAuthCallbackFailureKind } from "@modules/auth"
import { classifyAuthOAuthCallbackError } from "@modules/auth"

export type ConnectedAccountLinkCallbackFailureKind =
  | AuthOAuthCallbackFailureKind
  | "alreadyLinked"
  | "emailMismatch"

const LINK_ALREADY_LINKED = new Set([
  "account_already_linked_to_different_user",
  "account_ownership_conflict",
])

const LINK_EMAIL_MISMATCH = new Set([
  "email_does_not_match",
  "email_not_found",
  "email_not_verified",
])

export function classifyConnectedAccountLinkCallbackError(
  error: string | null | undefined
): ConnectedAccountLinkCallbackFailureKind {
  const shared = classifyAuthOAuthCallbackError(error)
  if (shared !== "provider") return shared

  if (!error?.trim()) return "provider"
  const code = error.trim().toLowerCase()
  if (LINK_ALREADY_LINKED.has(code)) return "alreadyLinked"
  if (LINK_EMAIL_MISMATCH.has(code)) return "emailMismatch"
  return "provider"
}

export const connectedAccountLinkCallbackMessageKey = {
  cancelled: "accountLinkCancelled",
  denied: "accountLinkDenied",
  expired: "accountLinkExpired",
  alreadyLinked: "accountAlreadyLinked",
  emailMismatch: "accountLinkEmailMismatch",
  provider: "accountLinkProviderError",
} as const satisfies Record<ConnectedAccountLinkCallbackFailureKind, string>

export function isConnectedAccountLinkCallbackSuccess(
  linkResult: string | null,
  error: string | null
): boolean {
  return linkResult === "success" && !error?.trim()
}
