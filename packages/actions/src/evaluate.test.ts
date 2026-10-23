import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { evaluatePermission, roleCapability } from "./evaluate";

describe("evaluatePermission", () => {
  it("allows owners for project-scoped actions", () => {
    const result = evaluatePermission({
      action: "project.update",
      orgRole: "owner",
      project: null,
    });
    assert.equal(result.allowed, true);
  });

  it("denies managers without project assignment", () => {
    const result = evaluatePermission({
      action: "project.update",
      orgRole: "manager",
      project: { isProjectManager: false, isProjectCreator: false },
    });
    assert.equal(result.allowed, false);
    if (!result.allowed) {
      assert.equal(result.reason, "not_project_manager");
    }
  });

  it("allows user-scoped actions without org role", () => {
    const result = evaluatePermission({
      action: "account.export",
      orgRole: null,
      project: null,
    });
    assert.equal(result.allowed, true);
  });

  it("allows project.unarchive for assigned project managers", () => {
    const result = evaluatePermission({
      action: "project.unarchive",
      orgRole: "manager",
      project: { isProjectManager: true, isProjectCreator: false },
    });
    assert.equal(result.allowed, true);
  });

  it("allows notification.mark_unread for any signed-in user", () => {
    const result = evaluatePermission({
      action: "notification.mark_unread",
      orgRole: null,
      project: null,
    });
    assert.equal(result.allowed, true);
  });

  it("allows members with team link and grant", () => {
    const result = evaluatePermission({
      action: "variable.read",
      orgRole: "member",
      project: {
        hasTeamLink: true,
        memberGrants: ["variable.read"],
      },
    });
    assert.equal(result.allowed, true);
  });

  it("denies members on project without team link", () => {
    const result = evaluatePermission({
      action: "variable.read",
      orgRole: "member",
      project: {
        hasTeamLink: false,
        memberGrants: ["variable.read"],
      },
    });
    assert.equal(result.allowed, false);
    if (!result.allowed) {
      assert.equal(result.reason, "no_team_on_project");
    }
  });

  it("allows a team lead to manage only team-scoped membership", () => {
    const teamLead = { belongsToOrganization: true, role: "lead" as const };
    assert.equal(
      evaluatePermission({
        action: "team.member.add",
        orgRole: "member",
        team: teamLead,
      }).allowed,
      true,
    );
    assert.equal(
      evaluatePermission({
        action: "team.member.remove",
        orgRole: "member",
        team: { ...teamLead, belongsToOrganization: false },
      }).allowed,
      false,
    );
    assert.equal(
      evaluatePermission({
        action: "team.member.role.change",
        orgRole: "member",
        team: teamLead,
      }).allowed,
      false,
    );
    assert.equal(
      evaluatePermission({
        action: "organization.settings.update",
        orgRole: "member",
        team: teamLead,
      }).allowed,
      false,
    );
  });
});

describe("roleCapability", () => {
  it("maps roles to yes / grant / no", () => {
    assert.equal(
      roleCapability("organization.settings.update", "owner"),
      "yes",
    );
    assert.equal(
      roleCapability("organization.settings.update", "member"),
      "no",
    );
    assert.equal(roleCapability("organization.archive", "owner"), "yes");
    assert.equal(roleCapability("organization.archive", "manager"), "no");
    assert.equal(roleCapability("organization.unarchive", "owner"), "yes");
    assert.equal(
      roleCapability("organization.transfer_ownership", "owner"),
      "yes",
    );
    assert.equal(
      roleCapability("organization.transfer_ownership", "manager"),
      "no",
    );
    assert.equal(roleCapability("organization.delete", "owner"), "yes");
    assert.equal(roleCapability("organization.delete", "member"), "no");
    assert.equal(roleCapability("member.invite", "manager"), "yes");
    assert.equal(roleCapability("variable.reveal", "owner"), "yes");
    assert.notEqual(roleCapability("variable.reveal", "member"), "yes");
  });
});

describe("custom organization permissions", () => {
  it("allows only explicitly delegated organization actions", () => {
    assert.equal(
      evaluatePermission({
        action: "member.invite",
        orgRole: "member",
        customOrganizationActions: ["member.invite"],
      }).allowed,
      true,
    );
    assert.equal(
      evaluatePermission({
        action: "member.remove",
        orgRole: "member",
        customOrganizationActions: ["member.remove"],
      }).allowed,
      false,
    );
  });

  it("never substitutes organization roles for project or app authorization", () => {
    assert.equal(
      evaluatePermission({
        action: "variable.read",
        orgRole: "member",
        customOrganizationActions: ["member.invite"],
      }).allowed,
      false,
    );
  });
});
