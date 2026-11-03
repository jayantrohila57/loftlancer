import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mcpToolNameFromAction } from "@features/authorization/utils";
import { mcpActionHandlers } from "./handlers";
import { listMcpExposedActions } from "./list-exposed-actions";

describe("MCP tools (api transport)", () => {
  it("maps tool names from canonical actions", () => {
    assert.equal(
      mcpToolNameFromAction("organization.list"),
      "organization_list",
    );
  });

  it("registers handlers for exposed product actions", () => {
    const actions = listMcpExposedActions();
    assert.ok(
      actions.length >= 15,
      `expected a substantive MCP surface, got ${actions.length}`,
    );
    for (const action of actions) {
      assert.ok(mcpActionHandlers[action], `missing handler for ${action}`);
    }
  });
});
