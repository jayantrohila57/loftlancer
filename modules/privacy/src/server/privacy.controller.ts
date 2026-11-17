import { protectedProcedure } from "@modules/security/server/shared/security.procedure"
import { createFailed } from "@packages/orpc"
import { ORPCError } from "@packages/orpc/server"
import { z } from "zod"
import { privacyRoutes } from "../utils/config/privacy.routes"
import {
  dataExportRequestInputSchema,
  dataExportRequestResponseSchema,
  privacyConsentsResponseSchema,
  privacyConsentsUpdateSchema,
} from "../utils/validation/privacy.schema"
import {
  privacyConsentsService,
  privacyDataExportService,
} from "./services/privacy.service"

export const privacyRouter = {
  consents: {
    get: protectedProcedure
      .route(privacyRoutes.consents.get)
      .output(privacyConsentsResponseSchema)
      .handler(async ({ context }) =>
        privacyConsentsResponseSchema.parse(
          await privacyConsentsService.get(context.auth.user.id)
        )
      ),
    update: protectedProcedure
      .route(privacyRoutes.consents.update)
      .use(async ({ next }, _input, output) => {
        try {
          return await next()
        } catch (error) {
          if (
            error instanceof ORPCError &&
            error.code === "BAD_REQUEST" &&
            error.message === "Input validation failed"
          )
            return output(
              privacyConsentsResponseSchema.parse(
                createFailed("Invalid privacy consent.", {
                  code: "INVALID_INPUT",
                  details: error.data,
                })
              )
            )
          throw error
        }
      })
      .input(z.object({ payload: privacyConsentsUpdateSchema }).strict())
      .output(privacyConsentsResponseSchema)
      .handler(async ({ context, input }) =>
        privacyConsentsResponseSchema.parse(
          await privacyConsentsService.update(
            context.auth.user.id,
            input.payload
          )
        )
      ),
  },
  dataExport: {
    request: protectedProcedure
      .route(privacyRoutes.dataExport.request)
      .input(z.object({ payload: dataExportRequestInputSchema }).strict())
      .output(dataExportRequestResponseSchema)
      .handler(async ({ context, input }) =>
        dataExportRequestResponseSchema.parse(
          await privacyDataExportService.request(
            context.auth.user.id,
            context.auth.user.email,
            input.payload
          )
        )
      ),
  },
}
