import { ORPCError } from "@packages/orpc/server"

import { assertOrganizationScope } from "../repositories/storage.repository.access"

/** Reject resource IDs that belong to another organization (403, not 404). */
export function denyCrossOrganizationResource(input: {
  expectedOrganizationId: string
  actualOrganizationId: string
}) {
  if (
    !assertOrganizationScope({
      expectedOrganizationId: input.expectedOrganizationId,
      actualOrganizationId: input.actualOrganizationId,
    })
  ) {
    throw new ORPCError("FORBIDDEN", {
      message: "That resource belongs to another organization.",
      data: { code: "rbac.cross_org" },
    })
  }
}
