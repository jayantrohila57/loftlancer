import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { userHasSupportManagerAccess } from "./server.support-manager.service";

describe("userHasSupportManagerAccess", () => {
  it("grants access to Better Auth platform admins without a support_manager row", async () => {
    const allowed = await userHasSupportManagerAccess("user-1", {
      role: "admin",
    });
    assert.equal(allowed, true);
  });

  it("denies non-admin users without a support_manager row", async () => {
    const allowed = await userHasSupportManagerAccess("user-1", {
      role: "user",
    });
    assert.equal(allowed, false);
  });
});
