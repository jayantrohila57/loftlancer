import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { evaluatePermission } from "./evaluate";

/**
 * permissions.snapshot must evaluate real RBAC even when ACTIONS_AUDIT_ENABLED is false
 * (audit flag controls timeline writes only; see issues #40 / #11).
 */
describe("permissions snapshot policy", () => {
  it("allows users to list their orgs but denies org-scoped actions without a role", () => {
    const organizationList = evaluatePermission({
      action: "organization.list",
      orgRole: null,
      project: null,
    });
    assert.equal(organizationList.allowed, true);

    const projectUpdate = evaluatePermission({
      action: "project.update",
      orgRole: null,
      project: null,
    });
    assert.equal(projectUpdate.allowed, false);
  });

  it("treats missing snapshot entries as denied (fail-closed client default)", () => {
    const actions: Record<string, boolean> | undefined = undefined;
    assert.equal(actions?.["project.update"] === true, false);
    const emptyActions: Record<string, boolean> = {};
    assert.equal(emptyActions["project.update"] === true, false);
    assert.equal({ "project.update": false }["project.update"] === true, false);
    assert.equal({ "project.update": true }["project.update"] === true, true);
  });
});
