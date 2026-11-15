import { serviceResponseSchema } from "@packages/orpc"
import { ORPCError } from "@packages/orpc/server"
import { z } from "zod"
import { orgRoutes } from "../utils/config/org.config.routes"
import { resumeOrganizationProvisioning } from "./services/org.service.resume-provisioning"
import { orgProcedure } from "./shared/org.procedure"

const orgProvisioningResumeOutputSchema = serviceResponseSchema(
  z.object({
    autumnBound: z.boolean(),
    reason: z.string().nullable(),
  })
)

export const orgProvisioningController = {
  resume: orgProcedure
    .route(orgRoutes.provisioningResume)
    .output(orgProvisioningResumeOutputSchema)
    .handler(async ({ context }) => {
      if (!context.isOrgOwner) {
        throw new ORPCError("FORBIDDEN", {
          message: "Only organization owners can resume provisioning.",
          data: { code: "rbac.org_owner_required" },
        })
      }
      return orgProvisioningResumeOutputSchema.parse(
        await resumeOrganizationProvisioning({
          organizationId: context.organizationId,
          ownerEmail: context.auth.user.email,
        })
      )
    }),
}
