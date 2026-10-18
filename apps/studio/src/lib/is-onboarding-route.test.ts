import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isOnboardingRoute } from "./is-onboarding-route";

describe("isOnboardingRoute", () => {
  it("keeps only onboarding routes accessible without an organization", () => {
    assert.equal(isOnboardingRoute("/onboarding", "/onboarding"), true);
    assert.equal(
      isOnboardingRoute("/onboarding/continue", "/onboarding"),
      true,
    );
    assert.equal(isOnboardingRoute("/", "/onboarding"), false);
    assert.equal(isOnboardingRoute("/new", "/onboarding"), false);
  });
});
