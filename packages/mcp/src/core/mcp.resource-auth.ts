import { createMcpProtectedRequestHandler } from "@better-auth/mcp";
import type { JWTPayload } from "jose";

import { resolveMcpResourceAuthConfig } from "../config/mcp.config";
import {
  MCP_BASE_SCOPE,
  parseGrantedScopes,
  requiredOAuthScopesForAction,
  tokenHasScopes,
} from "../utils/mcp.scopes";

export class McpInsufficientScopeError extends Error {
  readonly missingScopes: string[];

  constructor(missingScopes: string[]) {
    super(`insufficient_scope: ${missingScopes.join(" ")}`);
    this.name = "McpInsufficientScopeError";
    this.missingScopes = missingScopes;
  }
}

export function createMcpResourceHandler(
  handler: (request: Request, claims: JWTPayload) => Promise<Response>,
  options?: { requiredScopes?: readonly string[] },
) {
  const config = resolveMcpResourceAuthConfig();
  return createMcpProtectedRequestHandler(
    {
      issuer: config.issuer,
      audience: config.audience,
      jwksUrl: config.jwksUrl,
      requiredScopes: options?.requiredScopes ?? [MCP_BASE_SCOPE],
    },
    handler,
  );
}

export function assertTokenScopesForAction(
  claims: JWTPayload,
  action: Parameters<typeof requiredOAuthScopesForAction>[0],
): void {
  const granted = parseGrantedScopes(claims.scope);
  const required = requiredOAuthScopesForAction(action);
  if (!tokenHasScopes(granted, required)) {
    throw new McpInsufficientScopeError(
      required.filter((scope) => !granted.has(scope)),
    );
  }
}

export function getUserIdFromClaims(claims: JWTPayload): string {
  const sub = claims.sub;
  if (!sub || typeof sub !== "string") {
    throw new Error("invalid_token: missing sub");
  }
  return sub;
}

export function getOAuthClientIdFromClaims(claims: JWTPayload): string | null {
  const clientId = claims.client_id ?? claims.azp;
  return typeof clientId === "string" ? clientId : null;
}
