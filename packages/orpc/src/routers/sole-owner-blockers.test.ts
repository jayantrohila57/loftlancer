import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { soleOwnerBlockersFromCounts } from "./sole-owner-blockers";

describe("soleOwnerBlockersFromCounts", () => {
  it("returns orgs where the user is owner and only one active owner exists", () => {
    const owned = [
      {
        organizationId: "org-solo",
        orgName: "Solo Org",
        orgSlug: "solo",
      },
      {
        organizationId: "org-shared",
        orgName: "Shared Org",
        orgSlug: "shared",
      },
    ];
    const ownerCounts = [
      { organizationId: "org-solo", ownerCount: 1 },
      { organizationId: "org-shared", ownerCount: 2 },
    ];

    const blockers = soleOwnerBlockersFromCounts(owned, ownerCounts);

    assert.deepEqual(blockers, [
      {
        organizationId: "org-solo",
        name: "Solo Org",
        slug: "solo",
      },
    ]);
  });

  it("ignores orgs with zero owners in the count map", () => {
    const owned = [
      {
        organizationId: "org-missing",
        orgName: "Missing",
        orgSlug: "missing",
      },
    ];

    assert.deepEqual(soleOwnerBlockersFromCounts(owned, []), []);
  });
});
