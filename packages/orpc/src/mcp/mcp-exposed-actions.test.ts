import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { actionRegistry } from "@features/authorization/utils";
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

  it("includes environment and variable management tools", () => {
    const exposed = new Set(listMcpExposedActions());
    assert.ok(exposed.has("variable.reveal"));
    assert.ok(exposed.has("environment.create"));
  });

  it("does not register notification tools (user-scoped; studio UI only)", () => {
    const exposed = new Set(listMcpExposedActions());
    for (const name of Object.keys(mcpActionHandlers)) {
      if (name.startsWith("notification.")) {
        assert.ok(!exposed.has(name));
      }
    }
  });
});
