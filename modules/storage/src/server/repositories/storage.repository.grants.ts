import { member, orgStorageGrant } from "@packages/drizzle/schema"
import { and, eq } from "drizzle-orm"

import { denyCrossOrganizationResource } from "../shared/storage.org-scope"
import type { StorageOrgDb } from "./storage.repository.db"

export async function findStorageGrantById(input: {
  db: StorageOrgDb
  grantId: string
}) {
  const [row] = await input.db
    .select()
    .from(orgStorageGrant)
    .where(eq(orgStorageGrant.id, input.grantId))
    .limit(1)
  return row ?? null
}

export async function listOrganizationGrants(input: {
  db: StorageOrgDb
  organizationId: string
}) {
  return input.db
    .select({
      id: orgStorageGrant.id,
      userId: orgStorageGrant.userId,
      folderId: orgStorageGrant.folderId,
      itemId: orgStorageGrant.itemId,
      includesDescendants: orgStorageGrant.includesDescendants,
      createdAt: orgStorageGrant.createdAt,
    })
    .from(orgStorageGrant)
    .where(eq(orgStorageGrant.organizationId, input.organizationId))
}

export async function findOrganizationGrant(input: {
  db: StorageOrgDb
  organizationId: string
  grantId: string
}) {
  const row = await findStorageGrantById({
    db: input.db,
    grantId: input.grantId,
  })
  if (!row) return null
  denyCrossOrganizationResource({
    expectedOrganizationId: input.organizationId,
    actualOrganizationId: row.organizationId,
  })
  return row
}

export async function isOrgMember(input: {
  db: StorageOrgDb
  organizationId: string
  userId: string
}) {
  const [row] = await input.db
    .select({ userId: member.userId })
    .from(member)
    .where(
      and(
        eq(member.organizationId, input.organizationId),
        eq(member.userId, input.userId)
      )
    )
    .limit(1)
  return Boolean(row)
}
