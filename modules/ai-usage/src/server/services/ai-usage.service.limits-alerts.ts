import { getDb } from "@packages/drizzle"
import { createSuccess } from "@packages/orpc"
import { ORPCError } from "@packages/orpc/server"
import type { z } from "zod"
import type { aiUsageLimitsAlertsUpdatePayloadSchema } from "../../utils/validation/ai-usage.limits-alerts.schema"
import {
  readOrgAiUsagePolicy,
  upsertOrgAiUsagePolicy,
} from "../repositories/ai-usage.repository.limits-alerts"
import { readOrgAiUsageOverviewRow } from "../repositories/ai-usage.repository.overview"

const PRESET_COPY = {
  lowBalance: "Low balance (< 10 credits)",
  veryLowBalance: "Very low (< 3 credits)",
  depleted: "Depleted (0 credits)",
} as const

function serializePolicy(input: {
  organizationId: string
  isOrgOwner: boolean
  policy: Awaited<ReturnType<typeof readOrgAiUsagePolicy>>
}) {
  return {
    organizationId: input.organizationId,
    isOrgOwner: input.isOrgOwner,
    emailDeliveryAvailable: false,
    alertLowBalanceEnabled: input.policy.alertLowBalanceEnabled,
    alertVeryLowBalanceEnabled: input.policy.alertVeryLowBalanceEnabled,
    alertDepletedEnabled: input.policy.alertDepletedEnabled,
    monthlySpendCapEnabled: input.policy.monthlySpendCapEnabled,
    monthlySpendCapCredits: input.policy.monthlySpendCapCredits,
    presetLabels: PRESET_COPY,
    updatedAt: input.policy.updatedAt.toISOString(),
  }
}

async function assertOrgEntitlementReady(organizationId: string) {
  const db = getDb()
  if (!db) {
    throw new ORPCError("SERVICE_UNAVAILABLE", {
      message: "Database unavailable.",
    })
  }
  const row = await readOrgAiUsageOverviewRow({ db, organizationId })
  if (!row) {
    throw new ORPCError("FORBIDDEN", {
      message: "Organization entitlements are not ready.",
      data: { code: "billing.entitlement_missing" },
    })
  }
  return db
}

export async function aiUsageLimitsAlertsGetService(input: {
  organizationId: string
  isOrgOwner: boolean
}) {
  const db = await assertOrgEntitlementReady(input.organizationId)
  const policy = await readOrgAiUsagePolicy({
    db,
    organizationId: input.organizationId,
  })
  return createSuccess(
    serializePolicy({
      organizationId: input.organizationId,
      isOrgOwner: input.isOrgOwner,
      policy,
    }),
    "AI usage limits loaded."
  )
}

export async function aiUsageLimitsAlertsUpdateService(input: {
  organizationId: string
  isOrgOwner: boolean
  payload: z.infer<typeof aiUsageLimitsAlertsUpdatePayloadSchema>
}) {
  const db = await assertOrgEntitlementReady(input.organizationId)
  if (
    input.payload.monthlySpendCapEnabled &&
    input.payload.monthlySpendCapCredits === null
  ) {
    throw new ORPCError("BAD_REQUEST", {
      message: "Set a monthly credit cap when the cap is enabled.",
      data: { code: "INVALID_INPUT" },
    })
  }
  const policy = await upsertOrgAiUsagePolicy({
    db,
    organizationId: input.organizationId,
    patch: input.payload,
  })
  return createSuccess(
    serializePolicy({
      organizationId: input.organizationId,
      isOrgOwner: true,
      policy,
    }),
    "AI usage limits updated."
  )
}
