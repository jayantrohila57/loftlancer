import { getPlatformProductionOrigins } from "../config/better-auth.platform-urls";

function allowedOrigins(): Set<string> {
  return new Set(getPlatformProductionOrigins());
}

function corsHeadersForRequest(request: Request): Headers | null {
  const origin = request.headers.get("origin");
  if (!origin || !allowedOrigins().has(origin)) {
    return null;
  }
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Access-Control-Allow-Credentials", "true");
  headers.set("Vary", "Origin");
  return headers;
}

/** OPTIONS preflight for cross-origin Better Auth fetches (fallback when sibling proxy is unused). */
export function authApiCorsPreflightResponse(
  request: Request,
): Response | null {
  if (request.method !== "OPTIONS") {
    return null;
  }
  const cors = corsHeadersForRequest(request);
  if (!cors) {
    return new Response(null, { status: 204 });
  }
  cors.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  );
  cors.set(
    "Access-Control-Allow-Headers",
    request.headers.get("access-control-request-headers") ??
      "Content-Type, Authorization, X-Requested-With",
  );
  cors.set("Access-Control-Max-Age", "86400");
  return new Response(null, { status: 204, headers: cors });
}

export function withAuthApiCors(
  request: Request,
  response: Response,
): Response {
  const cors = corsHeadersForRequest(request);
  if (!cors) {
    return response;
  }
  const headers = new Headers(response.headers);
  for (const [key, value] of cors.entries()) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
