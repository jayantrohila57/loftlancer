import { protectedProcedure } from "@modules/security/server/shared/security.procedure"
import { createFailed } from "@packages/orpc"
import { ORPCError } from "@packages/orpc/server"
import { z } from "zod"
import { appearancePreferencesRoutes } from "../utils/config/appearance-preferences.routes"
import {
  appearancePreferencesResponseSchema,
  appearancePreferencesUpdateSchema,
} from "../utils/validation/appearance-preferences.schema"
import { appearancePreferencesService } from "./services/appearance-preferences.service"

export const appearancePreferencesRouter = {
  get: protectedProcedure
    .route(appearancePreferencesRoutes.get)
    .output(appearancePreferencesResponseSchema)
    .handler(async ({ context }) =>
      appearancePreferencesResponseSchema.parse(
        await appearancePreferencesService.get(context.auth.user.id)
      )
    ),
  update: protectedProcedure
    .route(appearancePreferencesRoutes.update)
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
            appearancePreferencesResponseSchema.parse(
              createFailed("Invalid appearance preference.", {
                code: "INVALID_INPUT",
                details: error.data,
              })
            )
          )
        throw error
      }
    })
    .input(z.object({ payload: appearancePreferencesUpdateSchema }).strict())
    .output(appearancePreferencesResponseSchema)
    .handler(async ({ context, input }) =>
      appearancePreferencesResponseSchema.parse(
        await appearancePreferencesService.update(
          context.auth.user.id,
          input.payload
        )
      )
    ),
}
