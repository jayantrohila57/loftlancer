import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isAlwaysAuditedAction } from "./registry";

describe("always-audited actions", () => {
  it("keeps sensitive auth, permission, deletion, and secret actions auditable", () => {
    for (const action of [
      "account.delete",
      "account.export",
      "member.role.update",
      "organization.delete",
      "platform.user.set_role",
      "project.delete",
      "project.permission.grant",
      "session.sign_in",
      "session.sign_out",
      "variable.export",
      "variable.reveal",
    ] as const) {
      assert.equal(isAlwaysAuditedAction(action), true, action);
    }
  });

  it("does not force routine reads or updates into the audit stream", () => {
    assert.equal(isAlwaysAuditedAction("organization.list"), false);
    assert.equal(isAlwaysAuditedAction("profile.update"), false);
  });
});
