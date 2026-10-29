import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isOrganizationShellRoute } from "./organizations.organization.layout";

describe("isOrganizationShellRoute", () => {
  it("keeps the organization shell for the organization and its sections", () => {
    for (const path of [
      "/acme",
      "/acme/projects",
      "/acme/projects/new",
      "/acme/members",
      "/studio/acme/teams",
    ]) {
      assert.equal(isOrganizationShellRoute(path, "acme", "/studio"), true);
    }
  });

  it("lets the project shell own project routes", () => {
    for (const path of [
      "/acme/website",
      "/acme/website/settings",
      "/studio/acme/website/tasks/12",
    ]) {
      assert.equal(isOrganizationShellRoute(path, "acme", "/studio"), false);
    }
  });

  it("recognizes encoded organization slugs", () => {
    assert.equal(
      isOrganizationShellRoute(
        "/studio/acme%20team/projects",
        "acme team",
        "/studio",
      ),
      true,
    );
    assert.equal(
      isOrganizationShellRoute(
        "/studio/acme%20team/site",
        "acme team",
        "/studio",
      ),
      false,
    );
  });
});
