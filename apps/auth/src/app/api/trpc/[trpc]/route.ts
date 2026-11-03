import { logSchemaOutOfDateOnce } from "@loftlancer/drizzle/postgres-errors";
import { createContextWithAuth } from "@loftlancer/orpc/core/orpc.create-context";
import { accountAppRouter } from "@loftlancer/orpc/routers/account-app";
import { logger } from "@loftlancer/sentry";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { NextRequest } from "next/server";
import { BASE_PATH } from "@/lib/base-path";
import { siblingAuth } from "@/lib/sibling-auth";

function handler(req: NextRequest) {
  return fetchRequestHandler({
    endpoint: new URL(req.url).pathname.startsWith(`${BASE_PATH}/api/trpc`)
      ? `${BASE_PATH}/api/trpc`
      : "/api/trpc",
    req,
    router: accountAppRouter,
    createContext: () => createContextWithAuth(req, siblingAuth),
    onError({ error, path, type }) {
      const root = error.cause ?? error;
      if (logSchemaOutOfDateOnce(root, `tRPC ${type} ${path ?? "unknown"}`)) {
        return;
      }
      const attributes = { "trpc.type": type, "trpc.path": path ?? "unknown" };
      // Only server faults become Sentry issues; client errors are just logs.
      if (error.code === "INTERNAL_SERVER_ERROR") {
        logger.exception("tRPC request failed", root, attributes);
      } else {
        logger.info("tRPC request rejected", {
          ...attributes,
          "trpc.code": error.code,
        });
      }
    },
  });
}

export { handler as GET, handler as POST };
