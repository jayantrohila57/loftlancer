import { getDb } from "@packages/drizzle"
import { invitation, organization, user } from "@packages/drizzle/schema"
import { eq } from "drizzle-orm"

export type OrgInvitationPreview = {
  readonly id: string
  readonly email: string
  readonly maskedEmail: string
  readonly status: string
  readonly expiresAt: string
  readonly organizationName: string
  readonly organizationSlug: string | null
  readonly role: string
  readonly expired: boolean
}

export function maskInvitationEmail(email: string): string {
  const trimmed = email.trim()
  const at = trimmed.indexOf("@")
  if (at <= 0) return "•••"
  const local = trimmed.slice(0, at)
  const domain = trimmed.slice(at + 1)
  const visible = local.slice(0, 1)
  return `${visible}•••@${domain}`
}

export async function readOrgInvitationPreview(
  invitationId: string
): Promise<OrgInvitationPreview | null> {
  const db = getDb()
  if (!db) return null

  const [row] = await db
    .select({
      id: invitation.id,
      email: invitation.email,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
      role: invitation.role,
      organizationName: organization.name,
      organizationSlug: organization.slug,
    })
    .from(invitation)
    .innerJoin(organization, eq(invitation.organizationId, organization.id))
    .where(eq(invitation.id, invitationId))
    .limit(1)

  if (!row) return null

  const expiresAt = new Date(row.expiresAt)
  const expired =
    row.status === "pending" && Number.isFinite(expiresAt.getTime())
      ? expiresAt.getTime() < Date.now()
      : row.status === "pending"

  return {
    id: row.id,
    email: row.email,
    maskedEmail: maskInvitationEmail(row.email),
    status: expired && row.status === "pending" ? "expired" : row.status,
    expiresAt: expiresAt.toISOString(),
    organizationName: row.organizationName,
    organizationSlug: row.organizationSlug,
    role: row.role,
    expired,
  }
}

export async function resolveInviterDisplayName(
  inviterId: string
): Promise<string> {
  const db = getDb()
  if (!db) return "A teammate"
  const [row] = await db
    .select({ name: user.name, email: user.email })
    .from(user)
    .where(eq(user.id, inviterId))
    .limit(1)
  const name = row?.name?.trim()
  if (name) return name
  const email = row?.email?.trim()
  if (email) return email
  return "A teammate"
}
