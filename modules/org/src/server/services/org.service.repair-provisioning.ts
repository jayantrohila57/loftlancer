import {
  ensureDefaultOrgStorageRoot,
  ensureOrgEntitlementRow,
  requireProvisioningDb,
} from "../repositories/org.repository.provisioning"

/** Idempotent repair when org rows exist but post-create provisioning failed partially. */
export async function repairOrganizationProvisioningRows(input: {
  organizationId: string
}) {
  const db = requireProvisioningDb()
  await db.transaction(async (tx) => {
    await ensureOrgEntitlementRow({
      organizationId: input.organizationId,
      tx,
    })
    await ensureDefaultOrgStorageRoot({
      organizationId: input.organizationId,
      tx,
    })
  })
}
