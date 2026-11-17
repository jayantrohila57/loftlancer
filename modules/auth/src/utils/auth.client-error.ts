import type { AuthErrorMessageKey } from "./auth.error-message"
import { resolveAuthErrorMessageKey } from "./auth.error-message"

type AuthClientError = {
  readonly code?: string
  readonly message?: string
  readonly status?: number
  readonly statusText?: string
}

type AuthClientErrorContext = {
  readonly provider?: "github" | "google"
}

export type AuthClientTranslate = (
  key: AuthErrorMessageKey,
  values?: Record<string, string>
) => string

function devOnlyProviderHint(
  provider: "github" | "google" | undefined
): string {
  if (process.env.NODE_ENV === "production" || !provider) return ""
  return ` Configure ${provider === "github" ? "GitHub" : "Google"} OAuth in apps/auth/.env.`
}

export function resolveAuthClientErrorMessageKey(
  error: AuthClientError | null | undefined,
  context?: AuthClientErrorContext
): AuthErrorMessageKey {
  if (
    !context?.provider &&
    (error?.code === "NOT_FOUND" || error?.status === 404)
  ) {
    return "authErrorServiceUnavailable"
  }

  if (
    error?.code === "PROVIDER_NOT_FOUND" ||
    (error?.status === 404 && context?.provider)
  ) {
    return "authErrorProviderNotConfigured"
  }

  if (error?.status === 429) {
    return "authErrorRateLimited"
  }

  const fromCode = resolveAuthErrorMessageKey(error?.code, context)
  if (fromCode !== "authErrorDescription") return fromCode

  const fromMessage = resolveAuthErrorMessageKey(error?.message, context)
  if (fromMessage !== "authErrorDescription") return fromMessage

  if (context?.provider) return "socialSignInFailed"
  return "authErrorDescription"
}

export function formatAuthClientError(
  error: AuthClientError | null | undefined,
  fallback: string,
  context?: AuthClientErrorContext & {
    readonly translate?: AuthClientTranslate
  }
): string {
  const key = resolveAuthClientErrorMessageKey(error, context)
  if (context?.translate) {
    const providerName =
      context.provider === "github"
        ? "GitHub"
        : context.provider === "google"
          ? "Google"
          : "Social"
    const localized = context.translate(
      key,
      key === "socialSignInFailed" || key === "authErrorProviderNotConfigured"
        ? { provider: providerName }
        : undefined
    )
    if (key === "authErrorProviderNotConfigured") {
      return `${localized}${devOnlyProviderHint(context.provider)}`
    }
    return localized
  }

  if (
    key === "authErrorProviderNotConfigured" ||
    (error?.code === "PROVIDER_NOT_FOUND" && context?.provider)
  ) {
    const label =
      context?.provider === "github"
        ? "GitHub"
        : context?.provider === "google"
          ? "Google"
          : "Social"
    const base = `${label} sign-in is not configured.`
    return `${base}${devOnlyProviderHint(context?.provider)}`
  }

  if (key === "authErrorServiceUnavailable") return fallback
  if (error?.message?.trim() && key === "authErrorDescription") {
    return error.message.trim()
  }
  if (error?.statusText?.trim() && key === "authErrorDescription") {
    return error.statusText.trim()
  }
  return fallback
}
