import { protectedProcedure } from "@modules/security/server/shared/security.procedure"
import { createFailed } from "@packages/orpc"
import { ORPCError } from "@packages/orpc/server"
import { activityRoutes } from "../utils/config/activity.config.activity"
import {
  deleteActivityInputSchema,
  deleteActivityOutputSchema,
} from "../utils/validation/activity.activity.delete.schema"
import {
  listActivityInputSchema,
  listActivityOutputSchema,
} from "../utils/validation/activity.activity.list.schema"
import { activityService } from "./services/activity.service.router"

export const activityController = {
  delete: protectedProcedure
    .route(activityRoutes.delete)
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
            deleteActivityOutputSchema.parse(
              createFailed("Invalid activity request.", {
                code: "INVALID_INPUT",
                details: error.data,
              })
            )
          )
        throw error
      }
    })
    .input(deleteActivityInputSchema)
    .output(deleteActivityOutputSchema)
    .handler(async ({ context, input }) =>
      deleteActivityOutputSchema.parse(
        await activityService.delete({
          payload: input.payload,
          system: { userId: context.auth.user.id },
        })
      )
    ),
  list: protectedProcedure
    .route(activityRoutes.list)
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
            listActivityOutputSchema.parse(
              createFailed("Invalid activity request.", {
                code: "INVALID_INPUT",
                details: error.data,
              })
            )
          )
        throw error
      }
    })
    .input(listActivityInputSchema)
    .output(listActivityOutputSchema)
    .handler(async ({ context, input }) =>
      listActivityOutputSchema.parse(
        await activityService.list({
          query: input.query,
          system: { userId: context.auth.user.id },
        })
      )
    ),
}
