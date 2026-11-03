import {
  authApiCorsPreflightResponse,
  withAuthApiCors,
} from "@loftlancer/better-auth/auth-api-cors";
import { toNextJsHandler } from "better-auth/next-js";
import type { NextRequest } from "next/server";
import { platformAuth } from "@/lib/platform-auth";

/**
 * Next strips the app basePath (e.g. `/auth`) from `request.url`, but Better Auth
 * runs at `<basePath>/api/auth` on the single-project deploy. Re-add it.
 */
const authBasePath = platformAuth.options.basePath ?? "/api/auth";

function withAppBasePath(request: Request): Request {
  const url = new URL(request.url);
  if (authBasePath === "/api/auth" || url.pathname.startsWith(authBasePath)) {
    return request;
  }
  if (!url.pathname.startsWith("/api/auth")) {
    return request;
  }
  url.pathname = `${authBasePath}${url.pathname.slice("/api/auth".length)}`;
  return new Request(url, request);
}

const { GET: authGet, POST: authPost } = toNextJsHandler((request: Request) =>
  platformAuth.handler(withAppBasePath(request)),
);

async function withCors(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<Response> | Response,
) {
  const preflight = authApiCorsPreflightResponse(request);
  if (preflight) {
    return preflight;
  }
  const response = await handler(request);
  return withAuthApiCors(request, response);
}

export function GET(request: NextRequest) {
  return withCors(request, authGet);
}

export function POST(request: NextRequest) {
  return withCors(request, authPost);
}

export function OPTIONS(request: NextRequest) {
  return (
    authApiCorsPreflightResponse(request) ??
    new Response(null, {
      status: 204,
    })
  );
}
