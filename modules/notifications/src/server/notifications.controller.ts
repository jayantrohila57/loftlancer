import { protectedProcedure } from "@modules/security/server/shared/security.procedure"
import { createFailed } from "@packages/orpc"
import { ORPCError } from "@packages/orpc/server"
import { z } from "zod"
import { notificationPreferencesRoutes } from "../utils/config/notifications.routes"
import {
  notificationPreferencesResponseSchema,
  notificationPreferencesUpdateSchema,
} from "../utils/validation/notifications.schema"
import { notificationPreferencesService } from "./services/notifications.service"

export const notificationsRouter = {
  preferences: {
    get: protectedProcedure
      .route(notificationPreferencesRoutes.get)
      .output(notificationPreferencesResponseSchema)
      .handler(async ({ context }) =>
        notificationPreferencesResponseSchema.parse(
          await notificationPreferencesService.get(context.auth)
        )
      ),
    update: protectedProcedure
      .route(notificationPreferencesRoutes.update)
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
              notificationPreferencesResponseSchema.parse(
                createFailed("Invalid notification preference.", {
                  code: "INVALID_INPUT",
                  details: error.data,
                })
              )
            )
          throw error
        }
      })
      .input(
        z.object({ payload: notificationPreferencesUpdateSchema }).strict()
      )
      .output(notificationPreferencesResponseSchema)
      .handler(async ({ context, input }) =>
        notificationPreferencesResponseSchema.parse(
          await notificationPreferencesService.update(
            context.auth,
            input.payload
          )
        )
      ),
  },
}
