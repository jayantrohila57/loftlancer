import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

import {
  NODE_CRYPTO_ALGORITHM,
  NODE_CRYPTO_AUTH_TAG_LENGTH,
  NODE_CRYPTO_ENCODING,
  NODE_CRYPTO_IV_LENGTH,
  NODE_CRYPTO_KEY_BYTES,
} from "../constants/node-crypto.constants";

function toKey(hexKey: string): Buffer {
  const key = Buffer.from(hexKey, "hex");
  if (key.length !== NODE_CRYPTO_KEY_BYTES) {
    throw new Error("Encryption key must be 32 bytes (64 hex characters)");
  }
  return key;
}

/** Encrypts with AES-256-GCM. Output format: iv:authTag:ciphertext */
export function encryptWithKey(text: string, hexKey: string): string {
  const key = toKey(hexKey);
  const iv = randomBytes(NODE_CRYPTO_IV_LENGTH);
  const cipher = createCipheriv(NODE_CRYPTO_ALGORITHM, key, iv);

  let encrypted = cipher.update(text, "utf8", NODE_CRYPTO_ENCODING);
  encrypted += cipher.final(NODE_CRYPTO_ENCODING);

  const authTag = cipher.getAuthTag().toString(NODE_CRYPTO_ENCODING);
  return `${iv.toString(NODE_CRYPTO_ENCODING)}:${authTag}:${encrypted}`;
}

/**
 * Decrypts iv:authTag:ciphertext. An empty ciphertext is valid (empty
 * plaintext encrypts to `iv:tag:`); the auth tag is still verified, so a
 * tampered or truncated value still throws.
 */
export function decryptWithKey(encryptedText: string, hexKey: string): string {
  const parts = encryptedText.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted text format");
  }

  const [ivBase64, authTagBase64, ciphertextBase64 = ""] = parts;
  if (!ivBase64 || !authTagBase64) {
    throw new Error("Invalid encrypted text parts");
  }

  const iv = Buffer.from(ivBase64, NODE_CRYPTO_ENCODING);
  const authTag = Buffer.from(authTagBase64, NODE_CRYPTO_ENCODING);
  if (
    iv.length !== NODE_CRYPTO_IV_LENGTH ||
    authTag.length !== NODE_CRYPTO_AUTH_TAG_LENGTH
  ) {
    throw new Error("Invalid encrypted text parts");
  }

  const decipher = createDecipheriv(NODE_CRYPTO_ALGORITHM, toKey(hexKey), iv, {
    authTagLength: NODE_CRYPTO_AUTH_TAG_LENGTH,
  });
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(
    ciphertextBase64,
    NODE_CRYPTO_ENCODING,
    "utf8",
  );
  decrypted += decipher.final("utf8");
  return decrypted;
}
