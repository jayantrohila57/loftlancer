import { createLoftlancerMcpHttpHandler } from "@loftlancer/mcp/handler";
import {
  mcpCorsPreflightResponse,
  withMcpCors,
} from "@loftlancer/mcp/http-cors";

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
