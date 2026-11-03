import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { evaluatePermission } from "@features/authorization/utils";

describe("evaluatePermission", () => {
  it("denies project mutations for org members without project grants", () => {
    const decision = evaluatePermission({
      action: "project.update",
      orgRole: "member",
      project: {
        isProjectCreator: false,
        isProjectManager: false,
        memberGrants: [],
      },
    });
    assert.equal(decision.allowed, false);
  });

  it("allows environment.read for assigned project managers", () => {
    const decision = evaluatePermission({
      action: "environment.read",
      orgRole: "manager",
      project: {
        isProjectManager: true,
      },
    });
    assert.equal(decision.allowed, true);
  });
});
