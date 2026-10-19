import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getPublicInvitationStatus } from "./invitation-preview";

const now = new Date("2026-10-19T12:00:00.000Z");
const pending = {
  status: "pending",
  expiresAt: new Date("2026-10-20T12:00:00.000Z"),
  deletedAt: null,
  organizationDeletedAt: null,
};

describe("getPublicInvitationStatus", () => {
  it("returns not found for an unknown invitation", () => {
    assert.equal(getPublicInvitationStatus(undefined, now), "not_found");
  });

  it("distinguishes pending and expired invitations", () => {
    assert.equal(getPublicInvitationStatus(pending, now), "pending");
    assert.equal(
      getPublicInvitationStatus(
        { ...pending, expiresAt: new Date("2026-10-19T11:59:59.000Z") },
        now,
      ),
      "expired",
    );
  });

  it("reports accepted, declined, and revoked invitations", () => {
    assert.equal(
      getPublicInvitationStatus({ ...pending, status: "accepted" }, now),
      "accepted",
    );
    assert.equal(
      getPublicInvitationStatus({ ...pending, status: "rejected" }, now),
      "declined",
    );
    assert.equal(
      getPublicInvitationStatus({ ...pending, status: "canceled" }, now),
      "revoked",
    );
    assert.equal(
      getPublicInvitationStatus({ ...pending, deletedAt: now }, now),
      "revoked",
    );
  });

  it("does not present invites for removed organizations as actionable", () => {
    assert.equal(
      getPublicInvitationStatus(
        { ...pending, organizationDeletedAt: now },
        now,
      ),
      "unavailable",
    );
  });
});
