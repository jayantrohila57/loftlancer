import { getPlatformProductionOrigins } from "@loftlancer/better-auth/platform-urls";

function allowedOrigins(): Set<string> {
  return new Set(getPlatformProductionOrigins());
}

export function mcpCorsHeadersForRequest(request: Request): Headers | null {
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

export function mcpCorsPreflightResponse(request: Request): Response | null {
  if (request.method !== "OPTIONS") {
    return null;
  }
  const cors = mcpCorsHeadersForRequest(request);
  if (!cors) {
    return new Response(null, { status: 204 });
  }
  cors.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  cors.set(
    "Access-Control-Allow-Headers",
    request.headers.get("access-control-request-headers") ??
      "Content-Type, Authorization, MCP-Protocol-Version",
  );
  cors.set("Access-Control-Max-Age", "86400");
  return new Response(null, { status: 204, headers: cors });
}

export function withMcpCors(request: Request, response: Response): Response {
  const cors = mcpCorsHeadersForRequest(request);
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
