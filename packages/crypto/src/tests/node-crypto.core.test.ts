import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { decryptWithKey, encryptWithKey } from "../core/node-crypto.core";

const KEY = "0123456789abcdef".repeat(4);

describe("node-crypto core", () => {
  it("round-trips a normal value", () => {
    const enc = encryptWithKey("hello=world:1", KEY);
    assert.equal(decryptWithKey(enc, KEY), "hello=world:1");
  });

  it("encrypts empty value to iv:tag: and decrypts it to empty string", () => {
    const enc = encryptWithKey("", KEY);
    assert.match(enc, /^[^:]+:[^:]+:$/);
    assert.equal(decryptWithKey(enc, KEY), "");
  });

  it("still rejects a tampered empty value", () => {
    const [iv] = encryptWithKey("", KEY).split(":");
    const badTag = Buffer.alloc(16, 1).toString("base64");
    assert.throws(() => decryptWithKey(`${iv}:${badTag}:`, KEY));
  });

  it("rejects missing iv or tag and bad formats", () => {
    assert.throws(
      () => decryptWithKey("::", KEY),
      /Invalid encrypted text parts/,
    );
    assert.throws(
      () => decryptWithKey("abc", KEY),
      /Invalid encrypted text format/,
    );
  });

  it("rejects the wrong key", () => {
    const enc = encryptWithKey("secret", KEY);
    assert.throws(() => decryptWithKey(enc, "f".repeat(64)));
  });
});
