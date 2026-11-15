export function isSessionRevokePath(path: string) {
  return path.includes("revoke")
}

export function shouldBlockCurrentSessionRevocation(input: {
  readonly path: string
  readonly deletedSessionToken: string
  readonly currentSessionToken: string | undefined
}) {
  if (!isSessionRevokePath(input.path)) return false
  if (!input.currentSessionToken) return false
  return input.deletedSessionToken === input.currentSessionToken
}

export function canRevokeListedSession(input: {
  readonly currentSessionId: string | undefined
  readonly targetSessionId: string
}) {
  return (
    Boolean(input.currentSessionId) &&
    input.currentSessionId !== input.targetSessionId
  )
}

export function countOtherSessions<T extends { id: string }>(
  sessions: readonly T[],
  currentSessionId: string | undefined
) {
  return sessions.filter((item) => item.id !== currentSessionId).length
}

export function sessionHasExpired(expiresAt: Date | string | undefined) {
  if (!expiresAt) return true
  const expires = new Date(expiresAt).getTime()
  return !Number.isFinite(expires) || expires <= Date.now()
}
