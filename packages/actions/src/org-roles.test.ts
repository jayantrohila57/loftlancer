import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normalizeOrgRole } from "./org-roles";

describe("normalizeOrgRole", () => {
  it("preserves the highest built-in role in legacy comma-separated values", () => {
    assert.equal(normalizeOrgRole("owner,member"), "owner");
    assert.equal(normalizeOrgRole("manager,member"), "manager");
    assert.equal(normalizeOrgRole("admin,member"), "manager");
    assert.equal(normalizeOrgRole("member"), "member");
  });
});
