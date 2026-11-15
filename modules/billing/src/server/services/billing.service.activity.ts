import { beginActivity, recordActivity } from "@modules/activity/server"
import { ORG_OWNER_MEMBER_ROLE } from "@modules/org/utils/constants/org.constants.entitlements"
import type { EntitlementSyncResult } from "@packages/billing"
import { getDb } from "@packages/drizzle"
import { member } from "@packages/drizzle/schema"
import { and, eq } from "drizzle-orm"

async function resolveOrganizationOwnerUserId(organizationId: string) {
  const db = getDb()
  if (!db) return null
  const [row] = await db
    .select({ userId: member.userId })
    .from(member)
    .where(
      and(
        eq(member.organizationId, organizationId),
        eq(member.role, ORG_OWNER_MEMBER_ROLE)
      )
    )
    .limit(1)
  return row?.userId ?? null
}

export async function recordBillingPlanChangedIfNeeded(input: {
  organizationId: string
  sync: EntitlementSyncResult
  source: "webhook" | "upgrade" | "downgrade"
  actorUserId?: string
}) {
  if (!input.sync.planTierChanged) return

  const ownerUserId = await resolveOrganizationOwnerUserId(input.organizationId)
  if (!ownerUserId) return

  const actor =
    input.source === "webhook"
      ? ({ type: "integration" } as const)
      : ({
          type: "user",
          userId: input.actorUserId ?? ownerUserId,
        } as const)

  const context = beginActivity({
    actionId: "billing.plan_changed",
    ownerUserId,
    actor,
  })

  await recordActivity(context, {
    outcome: "success",
    sourceApp: "auth",
    sourceModule: "billing",
    resourceType: "organization",
    resourceId: input.organizationId,
    metadata: {
      organizationId: input.organizationId,
      source: input.source,
    },
    beforeValue: { planTier: input.sync.planTierBefore },
    afterValue: { planTier: input.sync.planTierAfter },
  })
}
