/** Must match `linkAttemptKey` in connected-accounts link-attempt utils. */
const CONNECTED_ACCOUNTS_LINK_ATTEMPT_KEY = "connected-accounts-link-attempt"

/** Clears ephemeral browser state that must not survive an account switch. */
export function clearPrivateClientBrowserStorage(): void {
  if (typeof window === "undefined") return
  try {
    window.sessionStorage.removeItem(CONNECTED_ACCOUNTS_LINK_ATTEMPT_KEY)
  } catch {
    // Storage may be unavailable in restricted or private browsing contexts.
  }
}
