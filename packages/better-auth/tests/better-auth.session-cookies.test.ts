import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  findLegacySessionCookie,
  getLoftlancerSessionToken,
  hasSessionCookieFromAnyPrefix,
  isLegacySessionCookieName,
  LOFTLANCER_COOKIE_PREFIX,
  legacySessionCookieNamesToExpire,
} from "../src/core/better-auth.session-cookies";

describe("session-cookies", () => {
  it("reads loftlancer session token", () => {
    const headers = new Headers({
      cookie: "loftlancer.session_token=signed-token-value",
    });
    assert.equal(getLoftlancerSessionToken(headers), "signed-token-value");
  });

  it("finds legacy collidr cookie when loftlancer is absent", () => {
    const headers = new Headers({
      cookie: "collidr.session_token=legacy-signed-value",
    });
    const hit = findLegacySessionCookie(headers);
    assert.ok(hit);
    assert.equal(hit.prefix, "collidr");
    assert.equal(hit.rawValue, "legacy-signed-value");
  });

  it("finds legacy better-auth cookie when loftlancer is absent", () => {
    const headers = new Headers({
      cookie: "better-auth.session_token=legacy-signed-value",
    });
    const hit = findLegacySessionCookie(headers);
    assert.ok(hit);
    assert.equal(hit.prefix, "better-auth");
  });

  it("prefers loftlancer over legacy collidr", () => {
    const headers = new Headers({
      cookie:
        "loftlancer.session_token=new&collidr.session_token=legacy-signed-value",
    });
    assert.equal(findLegacySessionCookie(headers), null);
    assert.equal(hasSessionCookieFromAnyPrefix(headers), true);
  });

  it("lists legacy cookie names to expire", () => {
    const names = legacySessionCookieNamesToExpire("env-manager");
    assert.ok(names.includes("env-manager.session_token"));
    assert.ok(names.includes("__Secure-env-manager.session_token"));
  });

  it("detects legacy cookie names", () => {
    assert.equal(
      isLegacySessionCookieName("__Secure-better-auth.session_token"),
      true,
    );
    assert.equal(
      isLegacySessionCookieName(`${LOFTLANCER_COOKIE_PREFIX}.session_token`),
      false,
    );
    assert.equal(isLegacySessionCookieName("collidr.session_token"), true);
  });
});
