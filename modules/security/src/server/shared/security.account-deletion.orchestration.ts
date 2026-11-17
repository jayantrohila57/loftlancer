import { ORG_OWNER_MEMBER_ROLE } from "@modules/org/utils/constants/org.constants.entitlements"
import { teardownOrganizationForAccountDeletion } from "@packages/billing"
import { getDb } from "@packages/drizzle"
import {
  invitation,
  member,
  organization,
  user,
} from "@packages/drizzle/schema"
import { APIError } from "better-auth/api"
import { and, eq, ne, sql } from "drizzle-orm"

import { tombstoneUserForDeletion } from "./security.user-tombstone"

export type AccountDeletionOwnedOrg = {
  readonly organizationId: string
  readonly name: string
  readonly slug: string
  readonly otherMemberCount: number
}

export async function listOwnedOrganizationsForDeletion(userId: string) {
  const db = getDb()
  if (!db) throw new Error("Database unavailable")

  const owned = await db
    .select({
      organizationId: member.organizationId,
      name: organization.name,
      slug: organization.slug,
    })
    .from(member)
    .innerJoin(organization, eq(member.organizationId, organization.id))
    .where(
      and(eq(member.userId, userId), eq(member.role, ORG_OWNER_MEMBER_ROLE))
    )

  const results: AccountDeletionOwnedOrg[] = []
  for (const row of owned) {
    const [countRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(member)
      .where(
        and(
          eq(member.organizationId, row.organizationId),
          ne(member.userId, userId)
        )
      )
    results.push({
      organizationId: row.organizationId,
      name: row.name,
      slug: row.slug,
      otherMemberCount: countRow?.count ?? 0,
    })
  }
  return results
}

async function deleteSoleMemberOwnedOrganizations(userId: string) {
  const owned = await listOwnedOrganizationsForDeletion(userId)
  for (const org of owned) {
    if (org.otherMemberCount > 0) continue
    await teardownOrganizationForAccountDeletion({
      organizationId: org.organizationId,
    })
  }
}

async function removeNonOwnerMembershipsAndInvites(userId: string) {
  const db = getDb()
  if (!db) throw new Error("Database unavailable")

  const [row] = await db
    .select({ email: user.email })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)
  const email = row?.email

  await db.delete(member).where(eq(member.userId, userId))

  if (email) {
    await db
      .delete(invitation)
      .where(sql`lower(${invitation.email}) = lower(${email})`)
  }
}

export async function assertAccountDeletionAllowed(userId: string) {
  const blockers = (await listOwnedOrganizationsForDeletion(userId)).filter(
    (org) => org.otherMemberCount > 0
  )
  if (blockers.length === 0) return
  throw APIError.from("FORBIDDEN", {
    code: "ACCOUNT_DELETE_TRANSFER_OWNERSHIP_REQUIRED",
    message:
      "Transfer ownership for each organization with other members before deleting your account.",
  })
}

export async function prepareUserAccountDeletion(input: {
  readonly userId: string
  readonly originalEmail: string
}) {
  await assertAccountDeletionAllowed(input.userId)
  await deleteSoleMemberOwnedOrganizations(input.userId)
  await removeNonOwnerMembershipsAndInvites(input.userId)

  await tombstoneUserForDeletion(input.userId)
}
