import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { filterBlockedMemberActions } from "./policy";

describe("filterBlockedMemberActions", () => {
  it("keeps permissions allowed by the access evaluator", () => {
    assert.deepEqual(
      filterBlockedMemberActions(
        ["project.read", "environment.read"],
        new Set(),
        new Set(),
      ),
      ["project.read", "environment.read"],
    );
  });

  it("applies user, organization, and project denies after grants", () => {
    assert.deepEqual(
      filterBlockedMemberActions(
        ["project.read", "environment.read", "tasks.task.read"],
        new Set(["environment.read"]),
        new Set(["tasks.task.read"]),
      ),
      ["project.read"],
    );
  });

  it("treats a wildcard block as denying every action", () => {
    assert.deepEqual(
      filterBlockedMemberActions(
        ["project.read", "environment.read"],
        new Set(["*"]),
      ),
      [],
    );
  });
});
