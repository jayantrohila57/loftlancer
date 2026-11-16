/** Extract an organization id from Better Auth organization plugin payloads. */
export function readOrganizationIdFromResponse(data: unknown): string | null {
  if (!data || typeof data !== "object") return null
  const record = data as Record<string, unknown>
  if (typeof record.id === "string" && record.id.length > 0) return record.id
  const organization = record.organization
  if (organization && typeof organization === "object") {
    const orgId = (organization as Record<string, unknown>).id
    if (typeof orgId === "string" && orgId.length > 0) return orgId
  }
  const member = record.member
  if (member && typeof member === "object") {
    const orgId = (member as Record<string, unknown>).organizationId
    if (typeof orgId === "string" && orgId.length > 0) return orgId
  }
  return null
}

type SetActiveOrganization = (input: {
  organizationId: string
}) => Promise<{ error?: { message?: string } | null }>

/** Select the organization in session after create or accept flows. */
export async function activateOrganizationAfterJoin(
  setActive: SetActiveOrganization,
  data: unknown,
  input: { switchErrorMessage: string }
): Promise<void> {
  const organizationId = readOrganizationIdFromResponse(data)
  if (!organizationId) return
  const result = await setActive({ organizationId })
  if (result.error) {
    throw new Error(result.error.message?.trim() || input.switchErrorMessage)
  }
}

export function readOrganizationSlugFromResponse(data: unknown): string | null {
  if (!data || typeof data !== "object") return null
  const record = data as Record<string, unknown>
  if (typeof record.slug === "string" && record.slug.length > 0) {
    return record.slug
  }
  const organization = record.organization
  if (organization && typeof organization === "object") {
    const slug = (organization as Record<string, unknown>).slug
    if (typeof slug === "string" && slug.length > 0) return slug
  }
  return null
}
