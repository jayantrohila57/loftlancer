const DEFAULT_MCP_ORIGIN = "https://loftlancer.com";
const DEFAULT_AUTH_ORIGIN = "https://loftlancer.com/auth";

function trimTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

/** Canonical MCP HTTP POST URL (`apps/mcp` `/api/mcp`). */
export function mcpHttpEndpoint(): string {
  const origin = trimTrailingSlash(
    process.env.NEXT_PUBLIC_MCP_URL?.trim() ?? DEFAULT_MCP_ORIGIN,
  );
  return origin.endsWith("/api/mcp") ? origin : `${origin}/api/mcp`;
}

/** Auth app origin (`apps/auth`) — OAuth issuer and consent/device UI. */
export function authAppOrigin(): string {
  return trimTrailingSlash(
    process.env.NEXT_PUBLIC_AUTH_URL?.trim() ?? DEFAULT_AUTH_ORIGIN,
  );
}

export function McpHttpUrl() {
  return <code className="text-foreground">{mcpHttpEndpoint()}</code>;
}

export function AuthAppUrl() {
  return <code className="text-foreground">{authAppOrigin()}</code>;
}
