import { createFailed } from "@packages/orpc"
import { ORPCError } from "@packages/orpc/server"
import { orgRoutes } from "../utils/config/org.config.routes"
import {
  orgSetupGetOutputSchema,
  orgSetupPatchInputSchema,
  orgSetupPatchOutputSchema,
} from "../utils/validation/org.setup.api.schema"
import { orgSetupService } from "./services/org.service.setup"
import { orgProcedure } from "./shared/org.procedure"

export const orgSetupController = {
  get: orgProcedure
    .route(orgRoutes.setupGet)
    .output(orgSetupGetOutputSchema)
    .handler(async ({ context }) =>
      orgSetupGetOutputSchema.parse(
        await orgSetupService.get({
          organizationId: context.organizationId,
        })
      )
    ),
  patch: orgProcedure
    .route(orgRoutes.setupPatch)
    .use(async ({ next }, _input, output) => {
      try {
        return await next()
      } catch (error) {
        if (
          error instanceof ORPCError &&
          error.code === "BAD_REQUEST" &&
          error.message === "Input validation failed"
        ) {
          return output(
            orgSetupPatchOutputSchema.parse(
              createFailed("Invalid organization setup.", {
                code: "INVALID_INPUT",
                details: error.data,
              })
            )
          )
        }
        throw error
      }
    })
    .input(orgSetupPatchInputSchema)
    .output(orgSetupPatchOutputSchema)
    .handler(async ({ context, input }) =>
      orgSetupPatchOutputSchema.parse(
        await orgSetupService.patch({
          organizationId: context.organizationId,
          patch: input.patch,
          orgRole: context.orgRole,
        })
      )
    ),
}
