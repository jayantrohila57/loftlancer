import { createContextWithAuth } from "@loftlancer/api/create-context";
import { accountORPCRouter } from "@loftlancer/api/orpc";
import { logSchemaOutOfDateOnce } from "@loftlancer/db/postgres-errors";
import { logger } from "@loftlancer/logger";
import { RPCHandler } from "@orpc/server/fetch";
import type { NextRequest } from "next/server";
import { BASE_PATH } from "@/lib/base-path";
import { siblingAuth } from "@/lib/sibling-auth";

const orpcHandler = new RPCHandler(accountORPCRouter, {
  interceptors: [
    async ({ next, path }) => {
      try {
        return await next();
      } catch (error) {
        const root =
          error instanceof Error && error.cause ? error.cause : error;
        const operation = path.join(".") || "unknown";
        if (!logSchemaOutOfDateOnce(root, `oRPC ${operation}`)) {
          logger.exception("oRPC request failed", root, {
            "orpc.path": operation,
          });
        }
        throw error;
      }
    },
  ],
});

async function handler(request: NextRequest) {
  const prefix = new URL(request.url).pathname.startsWith(
    `${BASE_PATH}/api/orpc`,
  )
    ? `${BASE_PATH}/api/orpc`
    : "/api/orpc";
  const { response } = await orpcHandler.handle(request, {
    prefix: prefix as `/${string}`,
    context: () => createContextWithAuth(request, siblingAuth),
  });
  return response ?? new Response("Not found", { status: 404 });
}

export {
  handler as DELETE,
  handler as GET,
  handler as PATCH,
  handler as POST,
  handler as PUT,
};
