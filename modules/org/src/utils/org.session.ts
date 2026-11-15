type SessionCarrier = {
  readonly session?: {
    readonly activeOrganizationId?: string | null
    [key: string]: unknown
  } | null
}

/** Read `activeOrganizationId` from a Better Auth session payload. */
export function readActiveOrganizationId(
  session: SessionCarrier | null | undefined
): string | null {
  const id = session?.session?.activeOrganizationId
  return typeof id === "string" && id.length > 0 ? id : null
}
