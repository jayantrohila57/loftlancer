import assert from "node:assert/strict";
import { test } from "node:test";
import { getSignInHref } from "./sign-in-href";

test("marketing CTA uses auth app path and allowlisted studio return URL", () => {
  assert.equal(
    getSignInHref(
      "https://loftlancer.com/auth",
      "https://loftlancer.com/studio",
    ),
    "https://loftlancer.com/auth/api/sign-in/github?return_to=https%3A%2F%2Floftlancer.com%2Fstudio",
  );
});
