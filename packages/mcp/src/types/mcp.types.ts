import type { McpServer } from "@modelcontextprotocol/server";
import type { JWTPayload } from "jose";

export type McpResourceAuthConfig = {
  issuer: string;
  audience: string;
  jwksUrl: string;
};

export type RateLimitConfig = {
  windowMs: number;
  maxRequests: number;
};

export type RateLimitResult =
  | { allowed: true; remaining: number }
  | { allowed: false; retryAfterSeconds: number };

/** Registers MCP tools on a server for the authenticated JWT claims. */
export type McpToolRegistrar = (server: McpServer, claims: JWTPayload) => void;
