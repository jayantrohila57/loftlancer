import { FREE_OWNED_ORG_LIMIT } from "@modules/org/utils/constants/org.constants.entitlements"
import { APIError } from "@packages/better-auth"
import { bindOrganizationAutumnCustomer } from "@packages/billing"
import { logger } from "@packages/logger/server"
import type { OrganizationSetup } from "../../utils/validation/org.create.schema"
import type { OrganizationSetupV2 } from "../../utils/validation/org.setup.schema"

import {
  countOwnedOrganizationsForUser,
  ensureDefaultOrgStorageRoot,
  ensureOrgEntitlementRow,
  lockUserForOrgCreate,
  markOrgProvisioningAutumnPending,
  provisionOrganizationSetupRows,
  requireProvisioningDb,
} from "../repositories/org.repository.provisioning"

export async function assertUserCanCreateOwnedOrg(input: { userId: string }) {
  const db = requireProvisioningDb()
  await db.transaction(async (tx) => {
    await lockUserForOrgCreate({ userId: input.userId, tx })
    const ownedCount = await countOwnedOrganizationsForUser({
      userId: input.userId,
      executor: tx,
    })
    if (ownedCount >= FREE_OWNED_ORG_LIMIT) {
      throw APIError.from("FORBIDDEN", {
        message: "entitlement.org_limit",
        code: "ENTITLEMENT_ORG_LIMIT",
      })
    }
  })
}

/**
 * Idempotent org bootstrap after Better Auth creates the organization row.
 * Autumn customer binding runs after the DB transaction (deferred on API failure).
 */
export async function provisionOrganizationOnCreate(input: {
  organizationId: string
  setup?: OrganizationSetup | OrganizationSetupV2
  organizationName?: string | null
  ownerEmail?: string | null
}) {
  const db = requireProvisioningDb()
  try {
    await db.transaction(async (tx) => {
      if (input.setup)
        await provisionOrganizationSetupRows({
          organizationId: input.organizationId,
          setup: input.setup,
          tx,
        })
      await ensureOrgEntitlementRow({
        organizationId: input.organizationId,
        tx,
      })
      await ensureDefaultOrgStorageRoot({
        organizationId: input.organizationId,
        tx,
      })
      await markOrgProvisioningAutumnPending({
        organizationId: input.organizationId,
        tx,
      })
    })
    await bindOrganizationAutumnCustomer({
      organizationId: input.organizationId,
      organizationName: input.organizationName,
      ownerEmail: input.ownerEmail,
    })
  } catch (error) {
    logger.error("org.provision.failed", {
      app: "auth",
      module: "org",
      outcome: "error",
      errorCode: "org_provision_failed",
      output: {
        organizationId: input.organizationId,
        message: error instanceof Error ? error.message : "unknown",
      },
    })
    throw error
  }
}
