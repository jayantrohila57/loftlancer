import assert from "node:assert/strict";
import test from "node:test";
import { isOrganizationOptionalRoute } from "./is-organization-optional-route";

test("Overview and organization creation routes work without an organization", () => {
  assert.equal(isOrganizationOptionalRoute("/overview"), true);
  assert.equal(isOrganizationOptionalRoute("/organizations"), true);
  assert.equal(isOrganizationOptionalRoute("/new"), true);
  assert.equal(isOrganizationOptionalRoute("/notifications"), false);
  assert.equal(isOrganizationOptionalRoute("/acme/projects"), false);
});
