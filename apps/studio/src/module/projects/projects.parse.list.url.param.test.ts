import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseListUrlParam } from "./projects.parse.list.url.param";

describe("parseListUrlParam", () => {
  const allowed = new Set(["active", "archived"] as const);

  it("returns empty for null or blank", () => {
    assert.deepEqual(parseListUrlParam(null, allowed), []);
    assert.deepEqual(parseListUrlParam("  ", allowed), []);
  });

  it("parses comma-separated multi-value params", () => {
    assert.deepEqual(parseListUrlParam("active,archived", allowed), [
      "active",
      "archived",
    ]);
  });

  it("dedupes and ignores unknown tokens", () => {
    assert.deepEqual(
      parseListUrlParam("active, active, unknown, archived", allowed),
      ["active", "archived"],
    );
  });
});
