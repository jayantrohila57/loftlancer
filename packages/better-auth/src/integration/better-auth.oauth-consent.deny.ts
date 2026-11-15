/** OAuth error query parameter on redirects when the user denies consent. */
export const oauthConsentDenyErrorCode = "access_denied" as const

export function readOAuthConsentRedirectError(
  redirectUrl: string | undefined
): string | null {
  if (!redirectUrl?.trim()) return null
  try {
    return new URL(
      redirectUrl,
      "https://consent.redirect.invalid"
    ).searchParams.get("error")
  } catch {
    return null
  }
}

/**
 * True when a consent API JSON body looks like a successful token or code grant
 * rather than a redirect-only denial.
 */
export function oauthConsentResponseIssuesAccess(
  data: Record<string, unknown> | null | undefined
): boolean {
  if (!data) return false
  if (typeof data.access_token === "string" && data.access_token.length > 0) {
    return true
  }
  if (typeof data.refresh_token === "string" && data.refresh_token.length > 0) {
    return true
  }
  const redirectUrl = typeof data.url === "string" ? data.url : undefined
  if (!redirectUrl) return false
  try {
    const parsed = new URL(redirectUrl, "https://consent.redirect.invalid")
    if (parsed.searchParams.has("code")) return true
    if (parsed.hash.includes("access_token=")) return true
  } catch {
    return false
  }
  return false
}
