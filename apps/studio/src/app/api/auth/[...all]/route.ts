import { logSchemaOutOfDateOnce } from "@loftlancer/drizzle/postgres-errors";
import { toNextJsHandler } from "better-auth/next-js";
import type { NextRequest } from "next/server";
import { siblingAuth } from "@/lib/sibling-auth";

/** Next strips the app basePath (e.g. `/studio`) from `request.url`; Better Auth expects it. */
const authBasePath = siblingAuth.options.basePath ?? "/api/better-auth";

function withAppBasePath(request: Request): Request {
  const url = new URL(request.url);
  if (
    authBasePath === "/api/better-auth" ||
    url.pathname.startsWith(authBasePath) ||
    !url.pathname.startsWith("/api/better-auth")
  ) {
    return request;
  }
  url.pathname = `${authBasePath}${url.pathname.slice("/api/better-auth".length)}`;
  return new Request(url, request);
}

const { GET: authGet, POST: authPost } = toNextJsHandler((request: Request) =>
  siblingAuth.handler(withAppBasePath(request)),
);

function withSchemaGuard(
  handler: (req: NextRequest) => Promise<Response> | Response,
  method: string,
): (req: NextRequest) => Promise<Response> {
  return async (req: NextRequest) => {
    try {
      return await handler(req);
    } catch (error) {
      logSchemaOutOfDateOnce(error, `better-auth ${method}`);
      throw error;
    }
  };
}

export const GET = withSchemaGuard(authGet, "GET");
export const POST = withSchemaGuard(authPost, "POST");
