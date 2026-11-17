import type { AuthErrorMessageKey } from "./auth.error-message"
import { resolveAuthErrorMessageKey } from "./auth.error-message"

export type AuthPortalErrorDescriptionKey = AuthErrorMessageKey

export function resolveAuthPortalErrorDescriptionKey(
  error: string | null | undefined
): AuthPortalErrorDescriptionKey {
  return resolveAuthErrorMessageKey(error)
}
