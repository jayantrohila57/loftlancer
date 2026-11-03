import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isPassiveAuditAction } from "./audit-passive-actions";

describe("isPassiveAuditAction", () => {
  it("treats read and timeline-view actions as passive", () => {
    assert.equal(isPassiveAuditAction("project.read"), true);
    assert.equal(isPassiveAuditAction("environment.read"), true);
    assert.equal(isPassiveAuditAction("audit.timeline.view.org"), true);
    assert.equal(isPassiveAuditAction("audit.timeline.view.self"), true);
  });

  it("does not treat permission view actions as passive reads", () => {
    assert.equal(isPassiveAuditAction("organization.hub.view"), false);
    assert.equal(isPassiveAuditAction("profile.view"), false);
    assert.equal(isPassiveAuditAction("organization.settings.view"), false);
  });

  it("keeps mutating actions visible by default", () => {
    assert.equal(isPassiveAuditAction("project.create"), false);
    assert.equal(isPassiveAuditAction("variable.update"), false);
    assert.equal(isPassiveAuditAction("member.invite"), false);
    assert.equal(isPassiveAuditAction("notification.list"), false);
  });
});
