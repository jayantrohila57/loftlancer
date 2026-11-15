import { getDb } from "@packages/drizzle"
import { createError, createSuccess } from "@packages/orpc"
import { ORPCError } from "@packages/orpc/server"
import type { z } from "zod"
import type {
  OrganizationSetupV2,
  organizationSetupPatchSchema,
} from "../../utils/validation/org.setup.schema"
import { organizationSetupSchemaV2 } from "../../utils/validation/org.setup.schema"
import { provisionOrganizationSetupV2 } from "../repositories/org.repository.setup-provision"
import { readOrganizationSetupV2 } from "../repositories/org.repository.setup-read"

type SetupPatch = z.infer<typeof organizationSetupPatchSchema>

function mergeSetup(
  current: OrganizationSetupV2,
  patch: SetupPatch
): OrganizationSetupV2 {
  return organizationSetupSchemaV2.parse({
    version: 2,
    basics: { ...current.basics, ...patch.basics },
    business: { ...current.business, ...patch.business },
    contact: { ...current.contact, ...patch.contact },
    location: { ...current.location, ...patch.location },
    legal: { ...current.legal, ...patch.legal },
    branding: { ...current.branding, ...patch.branding },
    workspace: { ...current.workspace, ...patch.workspace },
    team: { ...current.team, ...patch.team },
  })
}

export const orgSetupService = {
  async get({ organizationId }: { organizationId: string }) {
    const setup = await readOrganizationSetupV2(organizationId)
    return createSuccess({ setup }, "Organization setup loaded.")
  },
  async patch({
    organizationId,
    patch,
    isOrgOwner,
  }: {
    organizationId: string
    patch: SetupPatch
    isOrgOwner: boolean
  }) {
    if (!isOrgOwner) {
      throw new ORPCError("FORBIDDEN", {
        message: "Only organization owners can edit setup.",
        data: { code: "rbac.org_owner_required" },
      })
    }
    const current = await readOrganizationSetupV2(organizationId)
    if (!current) {
      return createError("Organization setup not found.", {
        code: "ORG_SETUP_NOT_FOUND",
      })
    }
    const nextSetup = mergeSetup(current, patch)
    const db = getDb()
    if (!db) {
      throw new ORPCError("SERVICE_UNAVAILABLE", {
        message: "Database unavailable.",
      })
    }
    await db.transaction(async (tx) => {
      await provisionOrganizationSetupV2({
        organizationId,
        setup: nextSetup,
        tx,
      })
    })
    return createSuccess({ setup: nextSetup }, "Organization setup updated.")
  },
}
