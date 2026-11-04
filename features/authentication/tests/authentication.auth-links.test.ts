import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildSignInUrl,
  landingUrl,
  studioHomeUrl,
} from "../src/utils/authentication.auth-links";

describe("studioHomeUrl", () => {
  it("uses explicit studio URL", () => {
    assert.equal(
      studioHomeUrl({ studioUrl: "https://example.com/studio/" }),
      "https://example.com/studio",
    );
  });
});

describe("landingUrl", () => {
  it("is the site root", () => {
    assert.equal(
      landingUrl({ studioUrl: "https://example.com/studio" }),
      "https://example.com/",
    );
  });
});

describe("buildSignInUrl", () => {
  it("starts GitHub sign-in on the auth app, no return_to", () => {
    assert.equal(
      buildSignInUrl({
        authUrl: "https://example.com/auth",
        returnTo: "https://example.com/studio/acme",
      }),
      "https://example.com/auth/api/sign-in/github",
    );
  });

  it("starts Google sign-in when asked", () => {
    assert.equal(
      buildSignInUrl({
        authUrl: "https://example.com/auth",
        provider: "google",
      }),
      "https://example.com/auth/api/sign-in/google",
    );
  });
});
