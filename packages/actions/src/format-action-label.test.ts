import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatActionLabel } from "./format-action-label";

describe("formatActionLabel", () => {
  it("uses registry descriptions for known actions", () => {
    assert.equal(formatActionLabel("project.read"), "Read project");
    assert.equal(
      formatActionLabel("audit.timeline.view.org"),
      "View organization audit timeline",
    );
  });

  it("formats unknown actions as readable labels", () => {
    assert.equal(
      formatActionLabel("custom.unknown_action"),
      "custom · unknown action",
    );
  });
});
