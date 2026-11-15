import type { AnyMiddleware } from "@orpc/server"
import { ORPCError } from "@orpc/server"
import type { z } from "zod"

import { createFailed } from "./orpc.response"

export function catchOrpcInputValidationFailure<T extends z.ZodType>(
  outputSchema: T,
  message: string
): AnyMiddleware {
  return async ({ next }, _input, output) => {
    try {
      return await next()
    } catch (error) {
      if (
        error instanceof ORPCError &&
        error.code === "BAD_REQUEST" &&
        error.message === "Input validation failed"
      ) {
        return output(
          outputSchema.parse(
            createFailed(message, {
              code: "INVALID_INPUT",
              details: error.data,
            })
          )
        )
      }
      throw error
    }
  }
}
