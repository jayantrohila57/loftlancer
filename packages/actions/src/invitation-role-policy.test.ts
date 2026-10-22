import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { canAssignOrganizationInviteRole } from "./invitation-role-policy";

describe("organization invitation role assignment", () => {
  it("keeps invited built-in roles at or below the inviter", () => {
    assert.equal(canAssignOrganizationInviteRole("owner", "owner"), true);
    assert.equal(canAssignOrganizationInviteRole("manager", "manager"), true);
    assert.equal(canAssignOrganizationInviteRole("manager", "owner"), false);
    assert.equal(canAssignOrganizationInviteRole("member", "manager"), false);
    assert.equal(canAssignOrganizationInviteRole("member", "member"), true);
    assert.equal(canAssignOrganizationInviteRole(null, "member"), false);
  });
});
