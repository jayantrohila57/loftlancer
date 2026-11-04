import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveBetterAuthClientApiBaseURL } from "../src/client/utils/better-auth-client.resolve-api-base-url";

describe("resolveBetterAuthClientApiBaseURL", () => {
  it("returns undefined when baseURL is omitted", () => {
    assert.equal(resolveBetterAuthClientApiBaseURL(undefined), undefined);
  });

  it("appends /api/better-auth to an origin", () => {
    assert.equal(
      resolveBetterAuthClientApiBaseURL("https://loftlancer.com/auth"),
      "https://loftlancer.com/auth/api/better-auth",
    );
  });

  it("does not double-append when path already ends with /api/better-auth", () => {
    assert.equal(
      resolveBetterAuthClientApiBaseURL(
        "https://loftlancer.com/studio/api/better-auth/",
      ),
      "https://loftlancer.com/studio/api/better-auth",
    );
  });
});
