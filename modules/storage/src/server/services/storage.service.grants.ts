import { orgStorageGrant } from "@packages/drizzle/schema"
import { createSuccess } from "@packages/orpc"
import { ORPCError } from "@packages/orpc/server"
import { and, eq } from "drizzle-orm"
import { requireStorageDb } from "../repositories/storage.repository.db"
import {
  findOrganizationGrant,
  isOrgMember,
  listOrganizationGrants,
} from "../repositories/storage.repository.grants"
import {
  findOrgFolder,
  findOrgStorageItemScoped,
} from "../repositories/storage.repository.items"
import {
  beginStorageActivity,
  recordStorageActivity,
} from "../shared/storage.activity"

export async function listStorageGrantsService(input: {
  organizationId: string
}) {
  const db = requireStorageDb()
  const grants = await listOrganizationGrants({
    db,
    organizationId: input.organizationId,
  })
  return createSuccess({ grants }, "Grants loaded.")
}

export async function createStorageGrantService(input: {
  organizationId: string
  actorUserId: string
  userId: string
  folderId?: string
  itemId?: string
  includesDescendants?: boolean
}) {
  const db = requireStorageDb()
  if (
    !(await isOrgMember({
      db,
      organizationId: input.organizationId,
      userId: input.userId,
    }))
  ) {
    throw new ORPCError("BAD_REQUEST", {
      message: "Grantee must be a member of this organization.",
      data: { code: "storage.grantee_not_member" },
    })
  }

  if (input.folderId) {
    const folder = await findOrgFolder({
      db,
      organizationId: input.organizationId,
      folderId: input.folderId,
    })
    if (!folder) {
      throw new ORPCError("NOT_FOUND", {
        message: "Folder not found.",
        data: { code: "storage.folder_not_found" },
      })
    }
  }
  if (input.itemId) {
    const item = await findOrgStorageItemScoped({
      db,
      organizationId: input.organizationId,
      itemId: input.itemId,
    })
    if (item?.status !== "active") {
      throw new ORPCError("NOT_FOUND", {
        message: "File not found.",
        data: { code: "storage.item_not_found" },
      })
    }
  }

  const grantId = crypto.randomUUID()
  const activity = beginStorageActivity({
    actionId: "storage.grant.create",
    actorUserId: input.actorUserId,
  })
  await db.insert(orgStorageGrant).values({
    id: grantId,
    organizationId: input.organizationId,
    userId: input.userId,
    folderId: input.folderId ?? null,
    itemId: input.itemId ?? null,
    includesDescendants: input.includesDescendants ?? true,
  })
  await recordStorageActivity(activity, {
    outcome: "success",
    metadata: {
      organizationId: input.organizationId,
      grantId,
      granteeUserId: input.userId,
    },
  })
  return createSuccess({ grantId }, "Grant created.")
}

export async function revokeStorageGrantService(input: {
  organizationId: string
  actorUserId: string
  grantId: string
}) {
  const db = requireStorageDb()
  const grant = await findOrganizationGrant({
    db,
    organizationId: input.organizationId,
    grantId: input.grantId,
  })
  if (!grant) {
    throw new ORPCError("NOT_FOUND", {
      message: "Grant not found.",
      data: { code: "storage.grant_not_found" },
    })
  }

  const activity = beginStorageActivity({
    actionId: "storage.grant.revoke",
    actorUserId: input.actorUserId,
  })
  await db
    .delete(orgStorageGrant)
    .where(
      and(
        eq(orgStorageGrant.id, input.grantId),
        eq(orgStorageGrant.organizationId, input.organizationId)
      )
    )
  await recordStorageActivity(activity, {
    outcome: "success",
    metadata: {
      organizationId: input.organizationId,
      grantId: input.grantId,
    },
  })
  return createSuccess({ revoked: true as const }, "Grant revoked.")
}
