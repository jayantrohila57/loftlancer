import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { evaluateSessionAccess } from "./session-access";

describe("evaluateSessionAccess", () => {
  it("returns unauthenticated when session is missing", () => {
    assert.equal(evaluateSessionAccess(null).status, "unauthenticated");
  });

  it("returns banned when user is banned", () => {
    const result = evaluateSessionAccess({
      user: { id: "u1", banned: true, banReason: "abuse" },
      session: { id: "s1", userId: "u1", expiresAt: new Date() },
    } as never);
    assert.equal(result.status, "banned");
    if (result.status === "banned") {
      assert.equal(result.reason, "abuse");
    }
  });

  it("rejects sessions for deleted users", () => {
    const result = evaluateSessionAccess({
      user: { id: "u1", deletedAt: new Date() },
      session: { id: "s1", userId: "u1", expiresAt: new Date() },
    } as never);
    assert.equal(result.status, "deleted_user");
  });

  it("returns ok for active user", () => {
    const result = evaluateSessionAccess({
      user: { id: "u1", banned: false },
      session: { id: "s1", userId: "u1", expiresAt: new Date() },
    } as never);
    assert.equal(result.status, "ok");
  });
});
