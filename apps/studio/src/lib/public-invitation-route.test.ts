import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isPublicInvitationRoute } from "./public-invitation-route";

describe("isPublicInvitationRoute", () => {
  it("allows only the invitation landing route outside the session gate", () => {
    assert.equal(isPublicInvitationRoute("/invite/id-123"), true);
    assert.equal(isPublicInvitationRoute("/invite"), false);
    assert.equal(isPublicInvitationRoute("/invite/id-123/extra"), false);
    assert.equal(isPublicInvitationRoute("/organizations"), false);
  });
});
