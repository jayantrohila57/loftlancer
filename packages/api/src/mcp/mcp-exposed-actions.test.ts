import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { actionRegistry } from "@loftlancer/actions";
import { mcpActionHandlers } from "./handlers";
import { listMcpExposedActions } from "./list-exposed-actions";

describe("MCP exposed actions", () => {
  it("exposes every non-user, non-platform handler", () => {
    const implemented = new Set(Object.keys(mcpActionHandlers));
    const expected = Object.values(actionRegistry)
      .map((def) => def.name)
      .filter((name) => !name.startsWith("platform."))
      .filter((name) => actionRegistry[name]?.scope !== "user")
      .filter((name) => implemented.has(name))
      .sort();

    const exposed = listMcpExposedActions();
    assert.deepEqual(exposed, expected);
  });

  it("includes team and permission management tools", () => {
    const exposed = new Set(listMcpExposedActions());
    assert.ok(exposed.has("team.create"));
    assert.ok(exposed.has("project.permission.grant"));
    assert.ok(exposed.has("variable.reveal"));
  });

  it("exposes organization member suspension through the shared MCP guards", () => {
    assert.ok(listMcpExposedActions().includes("member.suspend"));
  });
});
