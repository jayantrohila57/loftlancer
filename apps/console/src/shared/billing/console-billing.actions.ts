"use server"

import { grantOrganizationPlan } from "@packages/billing"
import { getDb } from "@packages/drizzle"

import { requireConsoleAccess } from "@/shared/auth/console.session"

export async function grantConsoleOrganizationPlan(input: {
  organizationId: string
  planTier: "free" | "paid"
}): Promise<{ ok: true } | { ok: false; message: string }> {
  await requireConsoleAccess("en-us")
  const db = getDb()
  if (!db) return { ok: false, message: "Database unavailable." }
  try {
    await grantOrganizationPlan({
      db,
      organizationId: input.organizationId,
      planTier: input.planTier,
    })
    return { ok: true }
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Could not update the plan.",
    }
  }
}
