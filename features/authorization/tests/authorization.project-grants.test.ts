import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_TEAM_PROJECT_GRANTS,
  mergeProjectMemberGrants,
} from "../src/constants/authorization.project-grants";

describe("project member grants", () => {
  it("merges default team grants without duplicates", () => {
    const merged = mergeProjectMemberGrants(
      ["variable.reveal"],
      DEFAULT_TEAM_PROJECT_GRANTS,
    );
    assert.ok(merged.includes("project.read"));
    assert.ok(merged.includes("variable.read"));
    assert.equal(merged.filter((g) => g === "project.read").length, 1);
  });

  it("ignores unknown grant keys", () => {
    const merged = mergeProjectMemberGrants([], ["not.a.real.action"]);
    assert.deepEqual(merged, []);
  });
});
