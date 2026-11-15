import { protectedProcedure } from "@modules/security/server/shared/security.procedure"
import { createFailed } from "@packages/orpc"
import { ORPCError } from "@packages/orpc/server"
import { z } from "zod"
import { regionalPreferencesRoutes } from "../utils/config/regional-preferences.routes"
import {
  regionalPreferencesResponseSchema,
  regionalPreferencesUpdateSchema,
} from "../utils/validation/regional-preferences.schema"
import { regionalPreferencesService } from "./services/regional-preferences.service"

export const regionalPreferencesRouter = {
  get: protectedProcedure
    .route(regionalPreferencesRoutes.get)
    .output(regionalPreferencesResponseSchema)
    .handler(async ({ context }) =>
      regionalPreferencesResponseSchema.parse(
        await regionalPreferencesService.get(context.auth.user.id)
      )
    ),
  update: protectedProcedure
    .route(regionalPreferencesRoutes.update)
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
            regionalPreferencesResponseSchema.parse(
              createFailed("Invalid regional preference.", {
                code: "INVALID_INPUT",
                details: error.data,
              })
            )
          )
        throw error
      }
    })
    .input(z.object({ payload: regionalPreferencesUpdateSchema }).strict())
    .output(regionalPreferencesResponseSchema)
    .handler(async ({ context, input }) =>
      regionalPreferencesResponseSchema.parse(
        await regionalPreferencesService.update(
          context.auth.user.id,
          input.payload
        )
      )
    ),
}
