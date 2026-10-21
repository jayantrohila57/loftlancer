import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isProjectAppAccessAllowed } from "./project-app-access-policy";

describe("project app access", () => {
  it("preserves inherited project access for existing installs", () => {
    assert.equal(isProjectAppAccessAllowed({ mode: "inherited" }), true);
  });

  it("allows a direct app assignment inside the project boundary", () => {
    assert.equal(
      isProjectAppAccessAllowed({ mode: "restricted", hasDirectGrant: true }),
      true,
    );
  });

  it("allows a grant through a team linked to the project", () => {
    assert.equal(
      isProjectAppAccessAllowed({
        mode: "restricted",
        hasLinkedTeamGrant: true,
      }),
      true,
    );
  });

  it("denies unassigned users and missing app records", () => {
    assert.equal(isProjectAppAccessAllowed({ mode: "restricted" }), false);
    assert.equal(
      isProjectAppAccessAllowed({ mode: null, hasDirectGrant: true }),
      false,
    );
  });

  it("keeps project owners and managers able to recover restricted access", () => {
    assert.equal(
      isProjectAppAccessAllowed({
        mode: "restricted",
        bypassRestriction: true,
      }),
      true,
    );
  });
});
