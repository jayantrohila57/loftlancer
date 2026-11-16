import { getDb } from "@packages/drizzle"
import { orgEntitlement, orgStorageItem } from "@packages/drizzle/schema"
import { logger } from "@packages/logger/server"
import { and, eq, inArray, isNull, sql } from "drizzle-orm"

import { getAutumnClient, isAutumnConfigured } from "./billing.autumn-client"
import {
  AUTUMN_FEATURE_AI_USAGE_CREDITS,
  AUTUMN_FEATURE_ORG_STORAGE_BYTES,
} from "./billing.constants"
import {
  BILLING_USAGE_WARNING_RATIO,
  billingPlanConfigForTier,
} from "./billing.plan-config"
import {
  isPaymentGraceExpired,
  usageWarningLevel,
} from "./billing.webhook-events"

const ACCESS_CACHE_TTL_MS = 15_000
const QUOTA_COUNT_STATUSES = ["active", "pending_upload", "trash"] as const

export type BillingUsageWarning = "none" | "approaching" | "exhausted"

export type BillingAccessResult = {
  allowed: boolean
  used: number
  included: number
  remaining: number
  warning: BillingUsageWarning
  source: "cache" | "autumn" | "local"
  planTier: "free" | "paid"
  subscriptionStatus: string
  writeBlocked: boolean
  inGracePeriod: boolean
  cancelAtPeriodEnd: boolean
  featureId: string
}

export class BillingAccessError extends Error {
  readonly code:
    | "feature_denied"
    | "plan_required"
    | "usage_exceeded"
    | "write_blocked"
    | "entitlement_missing"
  readonly result: BillingAccessResult | null

  constructor(
    code: BillingAccessError["code"],
    message: string,
    result: BillingAccessResult | null = null
  ) {
    super(message)
    this.name = "BillingAccessError"
    this.code = code
    this.result = result
  }
}

type CacheEntry = { expiresAt: number; value: BillingAccessResult }

const accessCache = new Map<string, CacheEntry>()

function cacheKey(organizationId: string, featureId: string, required: number) {
  return `${organizationId}:${featureId}:${required}`
}

function readCache(key: string): BillingAccessResult | null {
  const entry = accessCache.get(key)
  if (!entry) return null
  if (entry.expiresAt <= Date.now()) {
    accessCache.delete(key)
    return null
  }
  return { ...entry.value, source: "cache" }
}

function writeCache(key: string, value: BillingAccessResult) {
  accessCache.set(key, {
    expiresAt: Date.now() + ACCESS_CACHE_TTL_MS,
    value,
  })
}

export function invalidateBillingAccessCache(organizationId?: string) {
  if (!organizationId) {
    accessCache.clear()
    return
  }
  for (const key of accessCache.keys()) {
    if (key.startsWith(`${organizationId}:`)) accessCache.delete(key)
  }
}

type EntitlementRow = {
  planTier: "free" | "paid"
  subscriptionStatus: string
  quotaBytes: number
  aiEnabled: boolean
  aiCreditBalance: number
  autumnCustomerId: string | null
  paymentGraceUntil: Date | null
  cancelAtPeriodEnd: boolean
}

async function loadEntitlement(
  organizationId: string
): Promise<EntitlementRow | null> {
  const db = getDb()
  if (!db) return null
  const [row] = await db
    .select({
      planTier: orgEntitlement.planTier,
      subscriptionStatus: orgEntitlement.subscriptionStatus,
      quotaBytes: orgEntitlement.quotaBytes,
      aiEnabled: orgEntitlement.aiEnabled,
      aiCreditBalance: orgEntitlement.aiCreditBalance,
      autumnCustomerId: orgEntitlement.autumnCustomerId,
      paymentGraceUntil: orgEntitlement.paymentGraceUntil,
      cancelAtPeriodEnd: orgEntitlement.cancelAtPeriodEnd,
    })
    .from(orgEntitlement)
    .where(eq(orgEntitlement.organizationId, organizationId))
    .limit(1)
  return row ?? null
}

async function loadStorageUsedBytes(organizationId: string): Promise<number> {
  const db = getDb()
  if (!db) return 0
  const [usage] = await db
    .select({
      usedBytes: sql<number>`coalesce(sum(${orgStorageItem.byteSize}), 0)::bigint`,
    })
    .from(orgStorageItem)
    .where(
      and(
        eq(orgStorageItem.organizationId, organizationId),
        inArray(orgStorageItem.status, [...QUOTA_COUNT_STATUSES]),
        isNull(orgStorageItem.purgedAt)
      )
    )
  return Number(usage?.usedBytes ?? 0)
}

function graceState(row: EntitlementRow, now = new Date()) {
  const until = row.paymentGraceUntil
  const inGracePeriod = Boolean(
    until && !isPaymentGraceExpired({ paymentGraceUntil: until, now })
  )
  const graceExpired = isPaymentGraceExpired({
    paymentGraceUntil: until,
    now,
  })
  return { inGracePeriod, graceExpired }
}

function isWriteBlockedForRow(input: {
  used: number
  included: number
  planTier: "free" | "paid"
}): boolean {
  return input.planTier === "free" && input.used > input.included
}

function localUsageForFeature(input: {
  row: EntitlementRow
  featureId: string
}): { used: number; included: number; allowed: boolean } | null {
  const config = billingPlanConfigForTier(input.row.planTier)
  if (input.featureId === AUTUMN_FEATURE_ORG_STORAGE_BYTES) {
    return null
  }
  if (input.featureId === AUTUMN_FEATURE_AI_USAGE_CREDITS) {
    const included = config.features.aiCredits.included
    const remaining = Math.max(0, input.row.aiCreditBalance)
    const used = Math.max(0, included - remaining)
    const allowed =
      input.row.aiEnabled && (included === 0 ? false : remaining > 0)
    return { used, included, allowed }
  }
  return { used: 0, included: 0, allowed: true }
}

export async function checkUsage(input: {
  organizationId: string
  featureId: string
  required?: number
}): Promise<BillingAccessResult> {
  const required = input.required ?? 1
  const key = cacheKey(input.organizationId, input.featureId, required)
  const cached = readCache(key)
  if (cached) return cached

  const row = await loadEntitlement(input.organizationId)
  if (!row) {
    throw new BillingAccessError(
      "entitlement_missing",
      "Organization entitlements are not ready."
    )
  }

  const { inGracePeriod } = graceState(row)
  let used = 0
  let included = 0
  let allowed = true
  let source: BillingAccessResult["source"] = "local"

  if (input.featureId === AUTUMN_FEATURE_ORG_STORAGE_BYTES) {
    used = await loadStorageUsedBytes(input.organizationId)
    included = row.quotaBytes
    allowed = used + required <= included
  } else {
    const local = localUsageForFeature({ row, featureId: input.featureId })
    if (local) {
      used = local.used
      included = local.included
      allowed =
        local.allowed && (included <= 0 ? false : used + required <= included)
    }
  }

  if (isAutumnConfigured() && row.autumnCustomerId) {
    const client = getAutumnClient()
    if (client) {
      try {
        const checked = await client.check({
          customerId: row.autumnCustomerId,
          featureId: input.featureId,
          requiredBalance: required,
        })
        allowed = checked.allowed
        if (checked.balance) {
          included = checked.balance.granted
          used = checked.balance.usage
        }
        source = "autumn"
      } catch (error) {
        logger.error("billing.access.check_failed", {
          app: "auth",
          module: "billing",
          outcome: "error",
          errorCode: "ACCESS_CHECK_FAILED",
          output: {
            organizationId: input.organizationId,
            featureId: input.featureId,
            message: error instanceof Error ? error.message : "unknown",
          },
        })
      }
    }
  }

  const remaining = Math.max(0, included - used)
  const writeBlocked = isWriteBlockedForRow({
    used,
    included,
    planTier: row.planTier,
  })
  if (writeBlocked && input.featureId === AUTUMN_FEATURE_ORG_STORAGE_BYTES) {
    allowed = false
  }

  const result: BillingAccessResult = {
    allowed,
    used,
    included,
    remaining,
    warning: usageWarningLevel({
      used,
      included,
      warningRatio: BILLING_USAGE_WARNING_RATIO,
    }),
    source,
    planTier: row.planTier,
    subscriptionStatus: row.subscriptionStatus,
    writeBlocked,
    inGracePeriod,
    cancelAtPeriodEnd: row.cancelAtPeriodEnd,
    featureId: input.featureId,
  }
  writeCache(key, result)
  return result
}

export async function requireFeature(input: {
  organizationId: string
  featureId: string
  required?: number
}): Promise<BillingAccessResult> {
  const result = await checkUsage(input)
  if (result.writeBlocked) {
    throw new BillingAccessError(
      "write_blocked",
      "This organization is over its plan limit and is read-only.",
      result
    )
  }
  if (!result.allowed) {
    throw new BillingAccessError(
      "usage_exceeded",
      "This action is not included in the current plan.",
      result
    )
  }
  return result
}

export async function requirePlan(input: {
  organizationId: string
  plan: "paid" | "free"
}): Promise<BillingAccessResult> {
  const row = await loadEntitlement(input.organizationId)
  if (!row) {
    throw new BillingAccessError(
      "entitlement_missing",
      "Organization entitlements are not ready."
    )
  }
  const { inGracePeriod } = graceState(row)
  const paidActive =
    row.planTier === "paid" &&
    (["active", "trialing"].includes(row.subscriptionStatus) || inGracePeriod)
  const allowed = input.plan === "free" ? true : paidActive
  const result: BillingAccessResult = {
    allowed,
    used: 0,
    included: 0,
    remaining: 0,
    warning: "none",
    source: "local",
    planTier: row.planTier,
    subscriptionStatus: row.subscriptionStatus,
    writeBlocked: false,
    inGracePeriod,
    cancelAtPeriodEnd: row.cancelAtPeriodEnd,
    featureId: "plan",
  }
  if (!allowed) {
    throw new BillingAccessError(
      "plan_required",
      "This action requires a Paid plan.",
      result
    )
  }
  return result
}

export async function isOrganizationWriteBlocked(
  organizationId: string
): Promise<boolean> {
  try {
    const result = await checkUsage({
      organizationId,
      featureId: AUTUMN_FEATURE_ORG_STORAGE_BYTES,
      required: 0,
    })
    return result.writeBlocked
  } catch (error) {
    if (error instanceof BillingAccessError) {
      return error.code === "write_blocked"
    }
    throw error
  }
}
