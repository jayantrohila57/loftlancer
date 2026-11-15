type AuthClientFailure = {
  readonly code?: string
  readonly message?: string
  readonly status?: number
  readonly statusText?: string
}

const TRANSIENT_HTTP_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504])

const TRANSIENT_ERROR_CODES = new Set([
  "SERVICE_UNAVAILABLE",
  "SESSIONS_UNAVAILABLE",
  "SIGN_IN_METHODS_UNAVAILABLE",
  "ACTIVITY_UNAVAILABLE",
  "LOCATION_UNAVAILABLE",
  "PREFERENCES_UNAVAILABLE",
])

export class TransientClientError extends Error {
  override readonly name = "TransientClientError"

  constructor(
    message: string,
    readonly detail?: AuthClientFailure | { readonly code?: string }
  ) {
    super(message)
  }
}

export function isTransientAuthFailure(
  error: AuthClientFailure | null | undefined
): boolean {
  if (!error) return false
  if (error.status !== undefined && TRANSIENT_HTTP_STATUSES.has(error.status))
    return true
  if (error.code && TRANSIENT_ERROR_CODES.has(error.code)) return true
  return false
}

export function isTransientError(error: unknown): boolean {
  if (error instanceof TransientClientError) return true
  if (!(error instanceof Error)) return false
  if (error.message === "Failed to fetch") return true
  const cause = error.cause
  if (cause instanceof TransientClientError) return true
  return false
}

function pause(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })
}

export async function withClientRetry<T>(
  run: () => Promise<T>,
  options?: { readonly maxAttempts?: number; readonly baseDelayMs?: number }
): Promise<T> {
  const maxAttempts = options?.maxAttempts ?? 3
  const baseDelayMs = options?.baseDelayMs ?? 250
  let attempt = 0
  let lastError: unknown
  while (attempt < maxAttempts) {
    attempt += 1
    try {
      return await run()
    } catch (error) {
      lastError = error
      if (!isTransientError(error) || attempt >= maxAttempts) throw error
      await pause(baseDelayMs * 2 ** (attempt - 1))
    }
  }
  throw lastError
}

export async function runAuthMutation(
  run: () => Promise<{ error: AuthClientFailure | null }>,
  fallback: string
): Promise<void> {
  await withClientRetry(async () => {
    const { error } = await run()
    if (!error) return
    if (isTransientAuthFailure(error)) {
      throw new TransientClientError(error.message?.trim() || fallback, error)
    }
    throw new Error(error.message?.trim() || fallback)
  })
}

type SessionRefreshResult = {
  readonly error?: unknown
  readonly isError?: boolean
}

export async function refreshAuthSession(
  refetch: () => Promise<unknown>
): Promise<void> {
  await withClientRetry(async () => {
    const result = await refetch()
    if (!result || typeof result !== "object") return
    const refresh = result as SessionRefreshResult
    if (!refresh.isError && !refresh.error) return
    throw new TransientClientError("Could not refresh session.")
  })
}
