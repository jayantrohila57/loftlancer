import { mcpCorsPreflightResponse, withMcpCors } from "@loftlancer/mcp";
import { createLoftlancerMcpHttpHandler } from "@loftlancer/orpc/mcp";

const mcpHandler = createLoftlancerMcpHttpHandler();

async function handler(request: Request) {
  const preflight = mcpCorsPreflightResponse(request);
  if (preflight) {
    return preflight;
  }
  const response = await mcpHandler(request);
  return withMcpCors(request, response);
}

export { handler as GET, handler as OPTIONS, handler as POST };
