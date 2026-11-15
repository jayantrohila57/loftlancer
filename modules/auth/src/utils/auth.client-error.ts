type AuthClientError = {
  readonly code?: string
  readonly message?: string
  readonly status?: number
  readonly statusText?: string
}

type AuthClientErrorContext = {
  readonly provider?: "github" | "google"
}

export function formatAuthClientError(
  error: AuthClientError | null | undefined,
  fallback: string,
  context?: AuthClientErrorContext
): string {
  if (
    !context?.provider &&
    (error?.code === "NOT_FOUND" || error?.status === 404)
  ) {
    return fallback
  }

  if (error?.message?.trim()) {
    return error.message.trim()
  }

  if (
    error?.code === "PROVIDER_NOT_FOUND" ||
    (error?.status === 404 && context?.provider)
  ) {
    const label =
      context?.provider === "github"
        ? "GitHub"
        : context?.provider === "google"
          ? "Google"
          : "Social"
    return `${label} sign-in is not configured. Add OAuth client ID and secret to apps/auth/.env.`
  }

  if (error?.statusText?.trim()) {
    return error.statusText
  }

  return fallback
}
