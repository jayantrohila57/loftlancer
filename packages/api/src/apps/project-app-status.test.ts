import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveProjectAppStatus } from "./project-app-status";

describe("resolveProjectAppStatus", () => {
  it("shows installed and retained apps in their lifecycle states", () => {
    assert.equal(resolveProjectAppStatus("active"), "active");
    assert.equal(resolveProjectAppStatus("uninstalled"), "uninstalled");
  });

  it("returns purged and missing apps to the installable catalog", () => {
    assert.equal(resolveProjectAppStatus("purged"), "available");
    assert.equal(resolveProjectAppStatus(undefined), "available");
  });
});
