import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { resolveMcpResourceAuthConfig } from "../src/config/mcp.config";
import { createMcpResourceHandler } from "../src/core/mcp.resource-auth";

describe("MCP resource auth", () => {
  it("exposes issuer, audience, and JWKS URLs", () => {
    process.env.BETTER_AUTH_URL = "https://better-auth.example.com";
    process.env.MCP_RESOURCE_URL = "https://mcp.example.com/api/mcp";
    const config = resolveMcpResourceAuthConfig();
    assert.equal(config.issuer, "https://better-auth.example.com");
    assert.equal(config.audience, "https://mcp.example.com/api/mcp");
    assert.equal(
      config.jwksUrl,
      "https://better-auth.example.com/api/better-auth/jwks",
    );
  });

  it("returns 401 JSON-RPC challenge without Authorization header", async () => {
    const handler = createMcpResourceHandler(async () => new Response("ok"));
    const response = await handler(
      new Request("https://mcp.example.com/api/mcp", { method: "POST" }),
    );
    assert.equal(response.status, 401);
    const body = (await response.json()) as { jsonrpc?: string };
    assert.equal(body.jsonrpc, "2.0");
    assert.ok(response.headers.get("www-authenticate"));
  });
});
