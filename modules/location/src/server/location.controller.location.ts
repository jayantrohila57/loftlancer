import { protectedProcedure } from "@modules/security/server/shared/security.procedure"
import { createFailed } from "@packages/orpc"
import { ORPCError } from "@packages/orpc/server"
import { locationRoutes } from "../utils/config/location.config.location"
import { deleteLocationOutputSchema } from "../utils/validation/location.location.delete.schema"
import { getLocationOutputSchema } from "../utils/validation/location.location.get.schema"
import {
  preferenceInputSchema,
  preferenceOutputSchema,
} from "../utils/validation/location.location.preference.schema"
import {
  saveLocationOutputSchema,
  saveLocationRequestSchema,
} from "../utils/validation/location.location.save.schema"
import { locationService } from "./services/location.service.router"

export const locationController = {
  delete: protectedProcedure
    .route(locationRoutes.delete)
    .output(deleteLocationOutputSchema)
    .handler(async ({ context }) =>
      deleteLocationOutputSchema.parse(
        await locationService.delete({
          system: {
            userId: context.auth.user.id,
            sessionId: context.auth.session.id,
          },
        })
      )
    ),
  get: protectedProcedure
    .route(locationRoutes.get)
    .output(getLocationOutputSchema)
    .handler(async ({ context }) =>
      getLocationOutputSchema.parse(
        await locationService.get({
          system: {
            userId: context.auth.user.id,
            sessionId: context.auth.session.id,
          },
        })
      )
    ),
  preference: protectedProcedure
    .route(locationRoutes.preference)
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
            preferenceOutputSchema.parse(
              createFailed("Invalid location preference.", {
                code: "INVALID_INPUT",
                details: error.data,
              })
            )
          )
        throw error
      }
    })
    .input(preferenceInputSchema)
    .output(preferenceOutputSchema)
    .handler(async ({ context, input }) =>
      preferenceOutputSchema.parse(
        await locationService.preference({
          system: {
            userId: context.auth.user.id,
            sessionId: context.auth.session.id,
          },
          payload: input.payload,
        })
      )
    ),
  save: protectedProcedure
    .route(locationRoutes.save)
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
            saveLocationOutputSchema.parse(
              createFailed("Invalid location.", {
                code: "INVALID_INPUT",
                details: error.data,
              })
            )
          )
        throw error
      }
    })
    .input(saveLocationRequestSchema)
    .output(saveLocationOutputSchema)
    .handler(async ({ context, input }) =>
      saveLocationOutputSchema.parse(
        await locationService.save({
          system: {
            userId: context.auth.user.id,
            sessionId: context.auth.session.id,
          },
          payload: input.payload,
        })
      )
    ),
}
