import {
  FREE_PLAN_QUOTA_BYTES,
  ORG_OWNER_MEMBER_ROLE,
  ORG_STORAGE_ROOT_DISPLAY_NAME,
} from "@modules/org/utils/constants/org.constants.entitlements"
import type { Db } from "@packages/drizzle"
import { getDb } from "@packages/drizzle"

type Transaction = Parameters<Parameters<Db["transaction"]>[0]>[0]
export type OrgProvisioningDbExecutor = Db | Transaction

import {
  member,
  organizationProfile,
  organizationSettings,
  orgEntitlement,
  orgStorageFolder,
  user,
} from "@packages/drizzle/schema"
import { and, eq, inArray, sql } from "drizzle-orm"
import type { OrganizationSetup } from "../../utils/validation/org.create.schema"
import type { OrganizationSetupV2 } from "../../utils/validation/org.setup.schema"
import { provisionOrganizationSetupV2 } from "./org.repository.setup-provision"

export async function provisionOrganizationSetupRows(input: {
  organizationId: string
  setup: OrganizationSetup | OrganizationSetupV2
  tx: OrgProvisioningDbExecutor
}) {
  if ("version" in input.setup && input.setup.version === 2) {
    await provisionOrganizationSetupV2({
      organizationId: input.organizationId,
      setup: input.setup,
      tx: input.tx,
    })
    return
  }
  await ensureOrgProfileAndSettings({
    organizationId: input.organizationId,
    setup: input.setup as OrganizationSetup,
    tx: input.tx,
  })
}

export async function ensureOrgProfileAndSettings(input: {
  organizationId: string
  setup: OrganizationSetup
  tx: OrgProvisioningDbExecutor
}) {
  await input.tx
    .insert(organizationProfile)
    .values({
      organizationId: input.organizationId,
      type: input.setup.type,
      description: input.setup.description || null,
      countryCode: input.setup.countryCode,
    })
    .onConflictDoNothing()
  await input.tx
    .insert(organizationSettings)
    .values({
      organizationId: input.organizationId,
      timezone: input.setup.timezone,
      currencyCode: input.setup.currencyCode,
    })
    .onConflictDoNothing()
}

export async function countOwnedOrganizationsForUser(input: {
  userId: string
  executor: OrgProvisioningDbExecutor
}) {
  const [row] = await input.executor
    .select({ count: sql<number>`count(*)::int` })
    .from(member)
    .where(
      and(
        eq(member.userId, input.userId),
        eq(member.role, ORG_OWNER_MEMBER_ROLE)
      )
    )
  return row?.count ?? 0
}

export async function listOwnedOrganizationIdsForUser(input: {
  userId: string
  executor: OrgProvisioningDbExecutor
}) {
  const rows = await input.executor
    .select({ organizationId: member.organizationId })
    .from(member)
    .where(
      and(
        eq(member.userId, input.userId),
        eq(member.role, ORG_OWNER_MEMBER_ROLE)
      )
    )
  return rows.map((row) => row.organizationId)
}

export async function loadMaxOwnedOrganizationLimitForUser(input: {
  userId: string
  executor: OrgProvisioningDbExecutor
  fallback: number
  paidLimit: number
}) {
  const organizationIds = await listOwnedOrganizationIdsForUser(input)
  if (organizationIds.length === 0) return input.fallback
  const rows = await input.executor
    .select({ planTier: orgEntitlement.planTier })
    .from(orgEntitlement)
    .where(inArray(orgEntitlement.organizationId, organizationIds))
  if (rows.some((row) => row.planTier === "paid")) return input.paidLimit
  return input.fallback
}

export async function lockUserForOrgCreate(input: {
  userId: string
  tx: OrgProvisioningDbExecutor
}) {
  await input.tx
    .select({ id: user.id })
    .from(user)
    .where(eq(user.id, input.userId))
    .for("update")
}

export async function ensureOrgEntitlementRow(input: {
  organizationId: string
  tx: OrgProvisioningDbExecutor
}) {
  const [existing] = await input.tx
    .select({ organizationId: orgEntitlement.organizationId })
    .from(orgEntitlement)
    .where(eq(orgEntitlement.organizationId, input.organizationId))
    .limit(1)
  if (existing) return false
  await input.tx.insert(orgEntitlement).values({
    organizationId: input.organizationId,
    planTier: "free",
    subscriptionStatus: "active",
    quotaBytes: FREE_PLAN_QUOTA_BYTES,
    aiEnabled: false,
    orgProvisioningStep: "entitlement_cache",
  })
  return true
}

export async function ensureDefaultOrgStorageRoot(input: {
  organizationId: string
  tx: OrgProvisioningDbExecutor
}) {
  const [existing] = await input.tx
    .select({ id: orgStorageFolder.id })
    .from(orgStorageFolder)
    .where(
      and(
        eq(orgStorageFolder.organizationId, input.organizationId),
        eq(orgStorageFolder.isRoot, true)
      )
    )
    .limit(1)
  if (existing) return false
  await input.tx.insert(orgStorageFolder).values({
    id: crypto.randomUUID(),
    organizationId: input.organizationId,
    parentFolderId: null,
    displayName: ORG_STORAGE_ROOT_DISPLAY_NAME,
    isRoot: true,
    depth: 0,
  })
  return true
}

export async function markOrgProvisioningAutumnPending(input: {
  organizationId: string
  tx: OrgProvisioningDbExecutor
}) {
  await input.tx
    .update(orgEntitlement)
    .set({ orgProvisioningStep: "autumn_bound" })
    .where(eq(orgEntitlement.organizationId, input.organizationId))
}

export function requireProvisioningDb() {
  const db = getDb()
  if (!db) throw new Error("Database is not configured")
  return db
}
