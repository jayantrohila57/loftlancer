import "server-only"

import { getAuth } from "@packages/better-auth"
import { getDb } from "@packages/drizzle"
import { member, organization } from "@packages/drizzle/schema"
import { and, eq } from "drizzle-orm"
import { cookies, headers } from "next/headers"
import { STUDIO_LAST_ORG_COOKIE } from "@/shared/org/studio-org.constants"

export type StudioUserOrganization = {
  readonly id: string
  readonly name: string
  readonly slug: string
  readonly role: string
}

async function requireDb() {
  const db = getDb()
  if (!db) {
    throw new Error("Database unavailable.")
  }
  return db
}

export async function listStudioUserOrganizations(
  userId: string
): Promise<StudioUserOrganization[]> {
  const db = await requireDb()
  return db
    .select({
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      role: member.role,
    })
    .from(member)
    .innerJoin(organization, eq(organization.id, member.organizationId))
    .where(eq(member.userId, userId))
}

export async function resolveStudioOrganizationMembership(
  userId: string,
  slug: string
): Promise<StudioUserOrganization | null> {
  const db = await requireDb()
  const [row] = await db
    .select({
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      role: member.role,
    })
    .from(organization)
    .innerJoin(member, eq(member.organizationId, organization.id))
    .where(and(eq(organization.slug, slug), eq(member.userId, userId)))
    .limit(1)
  return row ?? null
}

export async function setStudioActiveOrganization(organizationId: string) {
  const requestHeaders = await headers()
  try {
    await getAuth().api.setActiveOrganization({
      headers: requestHeaders,
      body: { organizationId },
    })
  } catch {
    // The org layout still renders; the client switcher can retry.
  }
}

export async function readLastStudioOrgSlug(): Promise<string | null> {
  const jar = await cookies()
  const value = jar.get(STUDIO_LAST_ORG_COOKIE)?.value?.trim() ?? ""
  return value.length > 0 ? value : null
}

export function pickStudioLandingSlug(
  organizations: readonly StudioUserOrganization[],
  input: {
    readonly lastSlug?: string | null
    readonly activeOrganizationId?: string | null
  }
): string | null {
  if (organizations.length === 0) return null
  if (input.lastSlug) {
    const match = organizations.find((org) => org.slug === input.lastSlug)
    if (match) return match.slug
  }
  if (input.activeOrganizationId) {
    const match = organizations.find(
      (org) => org.id === input.activeOrganizationId
    )
    if (match) return match.slug
  }
  return organizations[0]?.slug ?? null
}
