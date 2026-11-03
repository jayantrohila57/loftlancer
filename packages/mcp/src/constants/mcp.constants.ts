import type { RateLimitConfig } from "../types/mcp.types";

export const DEFAULT_MCP_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60_000,
  maxRequests: 120,
};

export const DEFAULT_MCP_WRITE_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60_000,
  maxRequests: 60,
};

export const DEFAULT_MCP_REVEAL_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60_000,
  maxRequests: 30,
};

/** Verbs treated as writes for MCP rate-limit tiers. */
export const MCP_WRITE_VERBS = new Set([
  "create",
  "update",
  "delete",
  "restore",
  "archive",
  "unarchive",
  "grant",
  "invite",
  "remove",
  "accept",
  "reject",
  "cancel",
  "import",
  "toggle",
  "change",
  "assign",
  "mark",
  "transfer",
]);
