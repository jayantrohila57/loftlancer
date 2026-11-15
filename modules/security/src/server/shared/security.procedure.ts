import { getAuth } from "@packages/better-auth"
import {
  getLogContext,
  logger,
  runWithLogContext,
} from "@packages/logger/server"
import { ORPCError, os } from "@packages/orpc/server"

export const protectedProcedure = os
  .$context<{ headers: Headers; responseHeaders: Headers }>()
  .route({
    spec: (operation) => ({
      ...operation,
      parameters: [
        ...(operation.parameters ?? []),
        {
          name: "Origin",
          in: "header",
          required: true,
          description:
            "The Auth app origin. Browsers send this automatically for POST requests.",
          schema: {
            type: "string",
            format: "uri",
          },
        },
      ],
    }),
  })
  .errors({
    BAD_REQUEST: { message: "Invalid request." },
    UNAUTHORIZED: { message: "Sign in first." },
    FORBIDDEN: { message: "Access denied." },
    SERVICE_UNAVAILABLE: { message: "Service unavailable." },
  })
  .use(async ({ next, path }, input) => {
    const requestId = getLogContext()?.requestId ?? crypto.randomUUID()
    const procedure = path.join(".")
    return runWithLogContext(
      { app: "auth", module: "orpc", requestId },
      async () => {
        const started = Date.now()
        logger.info("orpc.started", { procedure, input })
        try {
          const result = await next()
          logger.info("orpc.completed", {
            procedure,
            output: result.output,
            durationMs: Date.now() - started,
          })
          return result
        } catch (error) {
          logger.error("orpc.failed", {
            procedure,
            outcome: "error",
            durationMs: Date.now() - started,
            errorCode:
              error instanceof ORPCError ? error.code : "INTERNAL_ERROR",
          })
          throw error
        }
      }
    )
  })
  .use(async ({ context, next }) => {
    const session = await getAuth().api.getSession({
      headers: context.headers,
      returnHeaders: true,
    })
    for (const cookie of session.headers.getSetCookie())
      context.responseHeaders.append("set-cookie", cookie)
    const auth = session.response
    if (!auth)
      throw new ORPCError("UNAUTHORIZED", { message: "Sign in first." })
    return next({ context: { auth } })
  })
