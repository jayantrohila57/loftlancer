import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isProjectDateRangeValid, updateProjectInput } from "./validation";

describe("project date validation", () => {
  it("allows a target date on or after the start date", () => {
    assert.equal(isProjectDateRangeValid("2026-10-01", "2026-10-01"), true);
  });

  it("rejects a target date before the start date", () => {
    assert.equal(isProjectDateRangeValid("2026-10-02", "2026-10-01"), false);
  });

  it("allows clearing both dates in project settings", () => {
    const result = updateProjectInput.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Project",
      startDate: "",
      targetDate: "",
    });

    assert.equal(result.success, true);
  });
});
