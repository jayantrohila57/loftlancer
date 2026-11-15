import type { AuthOAuthCallbackFailureKind } from "./auth.oauth-callback-error"
import {
  authOAuthCallbackMessageKey,
  classifyAuthOAuthCallbackError,
} from "./auth.oauth-callback-error"

export type AuthPortalErrorDescriptionKey =
  | "authErrorDescription"
  | (typeof authOAuthCallbackMessageKey)[AuthOAuthCallbackFailureKind]

export function resolveAuthPortalErrorDescriptionKey(
  error: string | null | undefined
): AuthPortalErrorDescriptionKey {
  if (!error?.trim()) {
    return "authErrorDescription"
  }
  const kind = classifyAuthOAuthCallbackError(error)
  return authOAuthCallbackMessageKey[kind]
}
