/** True when a Better Auth invitation role string includes `owner`. */
export function invitationAssignsOwnerRole(role: string): boolean {
  return role
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .includes("owner")
}

/** Pending invites past `expiresAt` should not surface as actionable in UI. */
export function isInvitationAcceptable(input: {
  status: string
  expiresAt: Date | string
  now?: Date
}): boolean {
  if (input.status !== "pending") return false
  const expiresAt =
    input.expiresAt instanceof Date
      ? input.expiresAt
      : new Date(input.expiresAt)
  const now = input.now ?? new Date()
  return expiresAt.getTime() > now.getTime()
}
