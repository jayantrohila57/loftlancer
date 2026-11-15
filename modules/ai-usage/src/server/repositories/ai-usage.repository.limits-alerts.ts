import type { Db } from "@packages/drizzle"
import { orgAiUsagePolicy } from "@packages/drizzle/schema"
import { eq } from "drizzle-orm"

export type OrgAiUsagePolicyRow = {
  alertLowBalanceEnabled: boolean
  alertVeryLowBalanceEnabled: boolean
  alertDepletedEnabled: boolean
  monthlySpendCapEnabled: boolean
  monthlySpendCapCredits: number | null
  updatedAt: Date
}

const defaultPolicy = (): OrgAiUsagePolicyRow => ({
  alertLowBalanceEnabled: true,
  alertVeryLowBalanceEnabled: true,
  alertDepletedEnabled: true,
  monthlySpendCapEnabled: false,
  monthlySpendCapCredits: null,
  updatedAt: new Date(),
})

export async function readOrgAiUsagePolicy(input: {
  db: Db
  organizationId: string
}): Promise<OrgAiUsagePolicyRow> {
  const [row] = await input.db
    .select({
      alertLowBalanceEnabled: orgAiUsagePolicy.alertLowBalanceEnabled,
      alertVeryLowBalanceEnabled: orgAiUsagePolicy.alertVeryLowBalanceEnabled,
      alertDepletedEnabled: orgAiUsagePolicy.alertDepletedEnabled,
      monthlySpendCapEnabled: orgAiUsagePolicy.monthlySpendCapEnabled,
      monthlySpendCapCredits: orgAiUsagePolicy.monthlySpendCapCredits,
      updatedAt: orgAiUsagePolicy.updatedAt,
    })
    .from(orgAiUsagePolicy)
    .where(eq(orgAiUsagePolicy.organizationId, input.organizationId))
    .limit(1)
  return row ?? defaultPolicy()
}

export async function upsertOrgAiUsagePolicy(input: {
  db: Db
  organizationId: string
  patch: Partial<
    Pick<
      OrgAiUsagePolicyRow,
      | "alertLowBalanceEnabled"
      | "alertVeryLowBalanceEnabled"
      | "alertDepletedEnabled"
      | "monthlySpendCapEnabled"
      | "monthlySpendCapCredits"
    >
  >
}) {
  const existing = await readOrgAiUsagePolicy(input)
  const next = { ...existing, ...input.patch }
  await input.db
    .insert(orgAiUsagePolicy)
    .values({
      organizationId: input.organizationId,
      alertLowBalanceEnabled: next.alertLowBalanceEnabled,
      alertVeryLowBalanceEnabled: next.alertVeryLowBalanceEnabled,
      alertDepletedEnabled: next.alertDepletedEnabled,
      monthlySpendCapEnabled: next.monthlySpendCapEnabled,
      monthlySpendCapCredits: next.monthlySpendCapEnabled
        ? next.monthlySpendCapCredits
        : null,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: orgAiUsagePolicy.organizationId,
      set: {
        alertLowBalanceEnabled: next.alertLowBalanceEnabled,
        alertVeryLowBalanceEnabled: next.alertVeryLowBalanceEnabled,
        alertDepletedEnabled: next.alertDepletedEnabled,
        monthlySpendCapEnabled: next.monthlySpendCapEnabled,
        monthlySpendCapCredits: next.monthlySpendCapEnabled
          ? next.monthlySpendCapCredits
          : null,
        updatedAt: new Date(),
      },
    })
  return readOrgAiUsagePolicy(input)
}
