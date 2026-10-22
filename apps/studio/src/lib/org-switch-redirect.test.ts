import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { OrgListItem } from "@/components/org/active-organization-context";
import { pathAfterOrganizationSwitch } from "./org-switch-redirect";

const orgB: OrgListItem = {
  id: "org-b",
  name: "Org B",
  slug: "org-b",
};

describe("pathAfterOrganizationSwitch", () => {
  it("goes to the org list when next org is missing", () => {
    assert.equal(
      pathAfterOrganizationSwitch("/org-a/web", undefined, new Set()),
      "/organizations",
    );
  });

  it("moves org sections to the new org", () => {
    assert.equal(
      pathAfterOrganizationSwitch("/org-a/members", orgB, new Set()),
      "/org-b/members",
    );
    assert.equal(
      pathAfterOrganizationSwitch("/org-a", orgB, new Set()),
      "/org-b",
    );
  });

  it("falls back to the projects list when the slug is absent in the new org", () => {
    assert.equal(
      pathAfterOrganizationSwitch("/org-a/stale/env", orgB, new Set(["other"])),
      "/org-b/projects",
    );
  });

  it("keeps the project path when the new org has that slug", () => {
    assert.equal(
      pathAfterOrganizationSwitch(
        "/org-a/web/settings",
        orgB,
        new Set(["web"]),
      ),
      "/org-b/web/settings",
    );
  });

  it("leaves user-level and same-org routes alone", () => {
    assert.equal(
      pathAfterOrganizationSwitch("/support/tickets", orgB, new Set()),
      null,
    );
    assert.equal(
      pathAfterOrganizationSwitch("/org-b/teams", orgB, new Set()),
      null,
    );
  });
});
