import { protectedProcedure } from "@modules/security/server/shared/security.procedure"
import { createFailed } from "@packages/orpc"
import { ORPCError } from "@packages/orpc/server"
import {
  activityClearInputSchema,
  activityClearOutputSchema,
  activityDetailInputSchema,
  activityDetailOutputSchema,
  activityFeedInputSchema,
  activityFeedOutputSchema,
} from "../utils/validation/activity.events.schema"
import { unifiedActivityService } from "./services/activity.service.events"
import { buildActivityTargetViewer } from "./shared/activity.target-viewer"

export const unifiedActivityController = {
  feed: protectedProcedure
    .route({
      method: "POST",
      path: "/openapi/security/activity/feed",
      summary: "List unified activity",
      tags: ["Activity"],
    })
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
            activityFeedOutputSchema.parse(
              createFailed("Invalid activity request.", {
                code: "INVALID_INPUT",
              })
            )
          )
        throw error
      }
    })
    .input(activityFeedInputSchema)
    .output(activityFeedOutputSchema)
    .handler(async ({ context, input }) =>
      activityFeedOutputSchema.parse(
        await unifiedActivityService.feed(
          context.auth.user.id,
          input.query,
          await buildActivityTargetViewer(context.auth)
        )
      )
    ),
  detail: protectedProcedure
    .route({
      method: "POST",
      path: "/openapi/security/activity/detail",
      summary: "Get activity details",
      tags: ["Activity"],
    })
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
            activityDetailOutputSchema.parse(
              createFailed("Invalid activity request.", {
                code: "INVALID_INPUT",
              })
            )
          )
        throw error
      }
    })
    .input(activityDetailInputSchema)
    .output(activityDetailOutputSchema)
    .handler(async ({ context, input }) =>
      activityDetailOutputSchema.parse(
        await unifiedActivityService.detail(
          context.auth.user.id,
          input.query.activityId,
          await buildActivityTargetViewer(context.auth)
        )
      )
    ),
  clear: protectedProcedure
    .route({
      method: "POST",
      path: "/openapi/security/activity/clear",
      summary: "Clear unified activity",
      tags: ["Activity"],
    })
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
            activityClearOutputSchema.parse(
              createFailed("Invalid activity request.", {
                code: "INVALID_INPUT",
              })
            )
          )
        throw error
      }
    })
    .input(activityClearInputSchema)
    .output(activityClearOutputSchema)
    .handler(async ({ context, input }) =>
      activityClearOutputSchema.parse(
        await unifiedActivityService.clear(context.auth.user.id, input.payload)
      )
    ),
}
