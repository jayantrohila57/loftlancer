import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { NextRequest } from "next/server";
import { platformSessionMiddleware } from "../src/core/better-auth.platform-middleware";

const options = {
  appOrigin: "https://loftlancer.com/better-auth",
  protectedPrefixes: ["/settings"],
};

describe("platformSessionMiddleware", () => {
  it("redirects signed-out visitors with a no-store cache header", () => {
    const res = platformSessionMiddleware(
      new NextRequest("https://loftlancer.com/settings/profile"),
      options,
    );
    assert.ok(res);
    assert.equal(res.status, 307);
    assert.equal(res.headers.get("cache-control"), "private, no-store");
  });

  it("sends the one-time-token hop with a no-store cache header", () => {
    const res = platformSessionMiddleware(
      new NextRequest("https://loftlancer.com/settings?ott=abc"),
      options,
    );
    assert.ok(res);
    assert.match(res.headers.get("location") ?? "", /establish-session/);
    assert.equal(res.headers.get("cache-control"), "private, no-store");
  });

  it("lets signed-in and public requests through", () => {
    const signedIn = new NextRequest("https://loftlancer.com/settings", {
      headers: { cookie: "loftlancer.session_token=signed-token-value" },
    });
    assert.equal(platformSessionMiddleware(signedIn, options), undefined);
    const open = new NextRequest("https://loftlancer.com/device");
    assert.equal(platformSessionMiddleware(open, options), undefined);
  });
});
