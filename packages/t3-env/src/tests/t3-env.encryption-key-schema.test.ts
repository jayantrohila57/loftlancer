import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { encryptionKeySchema } from "../core/t3-env.encryption-key.schema";

describe("encryptionKeySchema", () => {
  const validKey = "a".repeat(64);

  it("accepts 64 hex characters", () => {
    assert.equal(encryptionKeySchema.safeParse(validKey).success, true);
    assert.equal(
      encryptionKeySchema.safeParse(
        "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
      ).success,
      true,
    );
  });

  it("rejects empty, short, and non-hex values", () => {
    assert.equal(encryptionKeySchema.safeParse("").success, false);
    assert.equal(encryptionKeySchema.safeParse("abc").success, false);
    assert.equal(encryptionKeySchema.safeParse("g".repeat(64)).success, false);
    assert.equal(encryptionKeySchema.safeParse(`${validKey}x`).success, false);
  });
});
