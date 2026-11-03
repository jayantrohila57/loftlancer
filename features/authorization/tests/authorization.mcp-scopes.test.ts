import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  describeMcpOAuthScopes,
  parseGrantedScopes,
  requiredOAuthScopesForAction,
  tokenHasScopes,
} from "../src/constants/authorization.mcp-scopes";

describe("MCP OAuth scopes", () => {
  it("maps read actions to :read scopes", () => {
    assert.deepEqual(requiredOAuthScopesForAction("organization.list"), [
      "mcp:tools",
      "organizations:read",
    ]);
  });

  it("maps write actions to :write scopes", () => {
    assert.deepEqual(requiredOAuthScopesForAction("variable.create"), [
      "mcp:tools",
      "variables:write",
    ]);
  });

  it("isolates reveal scope", () => {
    assert.deepEqual(requiredOAuthScopesForAction("variable.reveal"), [
      "mcp:tools",
      "variables:reveal",
    ]);
  });

  it("parses scope claim strings", () => {
    const granted = parseGrantedScopes("mcp:tools projects:read");
    assert.equal(tokenHasScopes(granted, ["mcp:tools"]), true);
    assert.equal(
      tokenHasScopes(granted, ["mcp:tools", "projects:write"]),
      false,
    );
  });

  it("describes known scopes in plain language", () => {
    const described = describeMcpOAuthScopes("mcp:tools variables:reveal");
    assert.equal(
      described[0]?.description,
      "Use Loftlancer tools through MCP clients",
    );
    assert.equal(described[1]?.description, "Reveal secret variable values");
  });
});
