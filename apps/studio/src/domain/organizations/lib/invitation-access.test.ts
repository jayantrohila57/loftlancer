import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  classifyInvitationAccessFailure,
  getInvitationSignInUrl,
} from "./invitation-access";

describe("invitation access", () => {
  it("identifies wrong-account and verification failures", () => {
    assert.equal(
      classifyInvitationAccessFailure(
        "You are not the recipient of the invitation",
      ),
      "wrong_account",
    );
    assert.equal(
      classifyInvitationAccessFailure(
        "Email verification required to view invitations",
      ),
      "email_verification_required",
    );
    assert.equal(
      classifyInvitationAccessFailure("Network error"),
      "unavailable",
    );
  });

  it("preserves the exact invite URL through OAuth sign-in", () => {
    const url = new URL(
      getInvitationSignInUrl("invite_id-123", {
        authUrl: "https://loftlancer.com/auth/",
        studioUrl: "https://loftlancer.com/studio/",
      }),
    );
    assert.equal(url.origin, "https://loftlancer.com");
    assert.equal(url.pathname, "/auth/api/sign-in/github");
    assert.equal(
      url.searchParams.get("return_to"),
      "https://loftlancer.com/studio/invite/invite_id-123",
    );
  });
});
