import { bindOrganizationAutumnCustomer } from "@packages/billing"
import { getDb } from "@packages/drizzle"
import { organization } from "@packages/drizzle/schema"
import { createSuccess } from "@packages/orpc"
import { ORPCError } from "@packages/orpc/server"
import { eq } from "drizzle-orm"

import { repairOrganizationProvisioningRows } from "./org.service.repair-provisioning"

export async function resumeOrganizationProvisioning(input: {
  organizationId: string
  ownerEmail?: string | null
}) {
  const db = getDb()
  if (!db) {
    throw new ORPCError("SERVICE_UNAVAILABLE", {
      message: "Database unavailable.",
    })
  }

  const [orgRow] = await db
    .select({ name: organization.name })
    .from(organization)
    .where(eq(organization.id, input.organizationId))
    .limit(1)

  await repairOrganizationProvisioningRows({
    organizationId: input.organizationId,
  })

  const bind = await bindOrganizationAutumnCustomer({
    organizationId: input.organizationId,
    organizationName: orgRow?.name,
    ownerEmail: input.ownerEmail,
  })

  return createSuccess(
    {
      autumnBound: bind.bound,
      reason: "bound" in bind && !bind.bound ? bind.reason : null,
    },
    bind.bound
      ? "Organization provisioning resumed."
      : "Entitlements were repaired; billing binding may still be pending."
  )
}
