import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { organizationProfilePatchSchema } from "./organization-profile-validation";

describe("organization profile patch contract", () => {
  it("allows omitted fields and explicit null clears", () => {
    assert.equal(
      organizationProfilePatchSchema.safeParse({ contactPhone: null }).success,
      true,
    );
  });

  it("rejects empty patches and unsupported URL schemes", () => {
    assert.equal(organizationProfilePatchSchema.safeParse({}).success, false);
    assert.equal(
      organizationProfilePatchSchema.safeParse({
        websiteUrl: "javascript:alert(1)",
      }).success,
      false,
    );
  });

  it("rejects unsafe country, size and future-year values", () => {
    assert.equal(
      organizationProfilePatchSchema.safeParse({ countryCode: "USA" }).success,
      false,
    );
    assert.equal(
      organizationProfilePatchSchema.safeParse({ sizeBand: "many" }).success,
      false,
    );
    assert.equal(
      organizationProfilePatchSchema.safeParse({
        foundedYear: new Date().getFullYear() + 1,
      }).success,
      false,
    );
  });
});
