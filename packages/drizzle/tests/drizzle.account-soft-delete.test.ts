import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { deletedAccountUserUpdate } from "../src/utils/drizzle.deleted-account-user";

describe("deletedAccountUserUpdate", () => {
  it("anonymizes PII and sets soft-delete columns", () => {
    const userId = "user_abc123";
    const patch = deletedAccountUserUpdate(userId);

    assert.equal(patch.name, "Deleted user");
    assert.equal(patch.email, `deleted-${userId}@users.deleted.local`);
    assert.equal(patch.image, null);
    assert.equal(patch.deletedBy, userId);
    assert.ok(patch.deletedAt instanceof Date);
  });
});
