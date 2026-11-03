import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { resolveMcpRateLimitConfig } from "../src/config/mcp.config";

describe("MCP rate limit config", () => {
  it("applies stricter rate limits for reveal and write verbs", () => {
    const read = resolveMcpRateLimitConfig("organization.list");
    const write = resolveMcpRateLimitConfig("project.create");
    const reveal = resolveMcpRateLimitConfig("variable.reveal");
    assert.ok(write.maxRequests <= read.maxRequests);
    assert.ok(reveal.maxRequests <= read.maxRequests);
  });
});
