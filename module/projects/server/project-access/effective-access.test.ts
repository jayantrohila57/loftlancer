import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getEffectiveProjectAccess } from "./effective-access";

describe("getEffectiveProjectAccess", () => {
  it("requires a linked team before member grants become effective", () => {
    const access = getEffectiveProjectAccess({
      role: "member",
      isProjectCreator: false,
      isProjectManager: false,
      linkedTeams: [],
      memberGrants: ["project.read"],
    });
    assert.deepEqual(access.effectiveActions, []);
    assert.deepEqual(access.sources, [
      "Direct grants (inactive until team access is linked)",
    ]);
  });

  it("shows only capabilities allowed by the shared evaluator", () => {
    const access = getEffectiveProjectAccess({
      role: "member",
      isProjectCreator: false,
      isProjectManager: false,
      linkedTeams: ["Design"],
      memberGrants: ["project.read", "variable.reveal"],
    });
    assert.ok(access.effectiveActions.includes("project.read"));
    assert.ok(access.effectiveActions.includes("variable.reveal"));
    assert.ok(!access.effectiveActions.includes("environment.create"));
    assert.deepEqual(access.sources, ["Team: Design", "Direct project grants"]);
  });

  it("includes organization owner and assigned project manager paths", () => {
    const owner = getEffectiveProjectAccess({
      role: "owner",
      isProjectCreator: false,
      isProjectManager: false,
      linkedTeams: [],
      memberGrants: [],
    });
    const manager = getEffectiveProjectAccess({
      role: "manager",
      isProjectCreator: false,
      isProjectManager: true,
      linkedTeams: [],
      memberGrants: [],
    });
    assert.ok(owner.effectiveActions.includes("project.read"));
    assert.deepEqual(owner.sources, ["Organization owner"]);
    assert.ok(manager.effectiveActions.includes("project.read"));
    assert.deepEqual(manager.sources, ["Project manager"]);
  });
});
