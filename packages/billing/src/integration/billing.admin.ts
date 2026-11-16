import type { Db } from "@packages/drizzle"
import {
  organization,
  orgEntitlement,
  orgStorageItem,
} from "@packages/drizzle/schema"
import { CustomerExpand } from "autumn-js"
import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm"
import { invalidateBillingAccessCache } from "./billing.access"
import { getAutumnClient } from "./billing.autumn-client"
import { syncEntitlementsFromAutumnCustomer } from "./billing.entitlement-sync"
import {
  resolveAutumnPlanIdFree,
  resolveAutumnPlanIdPaid,
} from "./billing.plan-ids"

const QUOTA_COUNT_STATUSES = ["active", "pending_upload", "trash"] as const

export type BillingAdminOrgRow = {
  organizationId: string
  organizationName: string | null
  planTier: "free" | "paid"
  subscriptionStatus: string
  quotaBytes: number
  usedBytes: number
  aiEnabled: boolean
  aiCreditBalance: number
  paymentGraceUntil: string | null
  cancelAtPeriodEnd: boolean
  autumnCustomerId: string | null
  entitlementsSyncedAt: string | null
}

export async function listOrganizationBillingAdmin(input: {
  db: Db
  limit?: number
  organizationId?: string
}): Promise<BillingAdminOrgRow[]> {
  const rows = await input.db
    .select({
      organizationId: orgEntitlement.organizationId,
      organizationName: organization.name,
      planTier: orgEntitlement.planTier,
      subscriptionStatus: orgEntitlement.subscriptionStatus,
      quotaBytes: orgEntitlement.quotaBytes,
      aiEnabled: orgEntitlement.aiEnabled,
      aiCreditBalance: orgEntitlement.aiCreditBalance,
      paymentGraceUntil: orgEntitlement.paymentGraceUntil,
      cancelAtPeriodEnd: orgEntitlement.cancelAtPeriodEnd,
      autumnCustomerId: orgEntitlement.autumnCustomerId,
      entitlementsSyncedAt: orgEntitlement.entitlementsSyncedAt,
    })
    .from(orgEntitlement)
    .leftJoin(organization, eq(organization.id, orgEntitlement.organizationId))
    .where(
      input.organizationId
        ? eq(orgEntitlement.organizationId, input.organizationId)
        : undefined
    )
    .orderBy(desc(orgEntitlement.updatedAt))
    .limit(input.limit ?? 100)

  const ids = rows.map((row) => row.organizationId)
  const usedByOrg = new Map<string, number>()
  if (ids.length > 0) {
    const usage = await input.db
      .select({
        organizationId: orgStorageItem.organizationId,
        usedBytes: sql<number>`coalesce(sum(${orgStorageItem.byteSize}), 0)::bigint`,
      })
      .from(orgStorageItem)
      .where(
        and(
          inArray(orgStorageItem.organizationId, ids),
          inArray(orgStorageItem.status, [...QUOTA_COUNT_STATUSES]),
          isNull(orgStorageItem.purgedAt)
        )
      )
      .groupBy(orgStorageItem.organizationId)
    for (const row of usage) {
      usedByOrg.set(row.organizationId, Number(row.usedBytes ?? 0))
    }
  }

  return rows.map((row) => ({
    organizationId: row.organizationId,
    organizationName: row.organizationName ?? null,
    planTier: row.planTier,
    subscriptionStatus: row.subscriptionStatus,
    quotaBytes: row.quotaBytes,
    usedBytes: usedByOrg.get(row.organizationId) ?? 0,
    aiEnabled: row.aiEnabled,
    aiCreditBalance: row.aiCreditBalance,
    paymentGraceUntil: row.paymentGraceUntil
      ? row.paymentGraceUntil.toISOString()
      : null,
    cancelAtPeriodEnd: row.cancelAtPeriodEnd,
    autumnCustomerId: row.autumnCustomerId,
    entitlementsSyncedAt: row.entitlementsSyncedAt
      ? row.entitlementsSyncedAt.toISOString()
      : null,
  }))
}

export async function grantOrganizationPlan(input: {
  db: Db
  organizationId: string
  planTier: "free" | "paid"
}) {
  const [row] = await input.db
    .select({ autumnCustomerId: orgEntitlement.autumnCustomerId })
    .from(orgEntitlement)
    .where(eq(orgEntitlement.organizationId, input.organizationId))
    .limit(1)
  if (!row) {
    throw new Error("Organization entitlements are not ready.")
  }
  const client = getAutumnClient()
  if (!client) {
    throw new Error("Autumn is not configured.")
  }
  const customerId = row.autumnCustomerId ?? input.organizationId
  const planId =
    input.planTier === "paid"
      ? resolveAutumnPlanIdPaid()
      : resolveAutumnPlanIdFree()
  const removePlanIds =
    input.planTier === "paid"
      ? [resolveAutumnPlanIdFree()]
      : [resolveAutumnPlanIdPaid()]
  await client.billing.attach({
    customerId,
    planId,
    removePlanIds,
    invoiceMode: {
      enabled: true,
      enablePlanImmediately: true,
    },
    enablePlanImmediately: true,
  })
  const customer = await client.customers.get({
    customerId,
    expand: [CustomerExpand.SubscriptionsPlan, CustomerExpand.BalancesFeature],
  })
  await syncEntitlementsFromAutumnCustomer({
    db: input.db,
    organizationId: input.organizationId,
    customer,
  })
  invalidateBillingAccessCache(input.organizationId)
}
