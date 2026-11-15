import type { Db } from "@packages/drizzle"
import { orgEntitlement } from "@packages/drizzle/schema"
import { eq } from "drizzle-orm"

export async function readOrgAutumnCustomerId(input: {
  db: Db
  organizationId: string
}) {
  const [row] = await input.db
    .select({ autumnCustomerId: orgEntitlement.autumnCustomerId })
    .from(orgEntitlement)
    .where(eq(orgEntitlement.organizationId, input.organizationId))
    .limit(1)
  return row?.autumnCustomerId ?? null
}
