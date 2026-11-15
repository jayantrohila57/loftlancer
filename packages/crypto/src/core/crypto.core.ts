import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto"

import {
  CRYPTO_ALGORITHM,
  CRYPTO_AUTH_TAG_LENGTH,
  CRYPTO_ENCODING,
  CRYPTO_IV_LENGTH,
  CRYPTO_KEY_BYTES,
} from "../constants/crypto.constants"
import { CryptoError } from "../types/crypto.errors"

function toKey(hexKey: string): Buffer {
  const key = Buffer.from(hexKey, "hex")
  if (key.length !== CRYPTO_KEY_BYTES) {
    throw new CryptoError(
      "crypto.invalid_key",
      "Encryption key must be 32 bytes (64 hex characters)"
    )
  }
  return key
}

/** Encrypts with AES-256-GCM. Output format: `iv:authTag:ciphertext`. */
export function encryptWithKey(text: string, hexKey: string): string {
  const key = toKey(hexKey)
  const iv = randomBytes(CRYPTO_IV_LENGTH)
  const cipher = createCipheriv(CRYPTO_ALGORITHM, key, iv)

  let encrypted = cipher.update(text, "utf8", CRYPTO_ENCODING)
  encrypted += cipher.final(CRYPTO_ENCODING)

  const authTag = cipher.getAuthTag().toString(CRYPTO_ENCODING)
  return `${iv.toString(CRYPTO_ENCODING)}:${authTag}:${encrypted}`
}

/**
 * Decrypts `iv:authTag:ciphertext`. Empty ciphertext is valid (`iv:tag:` → `""`);
 * the auth tag is still verified.
 */
export function decryptWithKey(encryptedText: string, hexKey: string): string {
  const parts = encryptedText.split(":")
  if (parts.length !== 3) {
    throw new CryptoError(
      "crypto.invalid_format",
      "Invalid encrypted text format"
    )
  }

  const [ivBase64, authTagBase64, ciphertextBase64 = ""] = parts
  if (!ivBase64 || !authTagBase64) {
    throw new CryptoError(
      "crypto.invalid_parts",
      "Invalid encrypted text parts"
    )
  }

  const iv = Buffer.from(ivBase64, CRYPTO_ENCODING)
  const authTag = Buffer.from(authTagBase64, CRYPTO_ENCODING)
  if (
    iv.length !== CRYPTO_IV_LENGTH ||
    authTag.length !== CRYPTO_AUTH_TAG_LENGTH
  ) {
    throw new CryptoError(
      "crypto.invalid_parts",
      "Invalid encrypted text parts"
    )
  }

  const decipher = createDecipheriv(CRYPTO_ALGORITHM, toKey(hexKey), iv, {
    authTagLength: CRYPTO_AUTH_TAG_LENGTH,
  })
  decipher.setAuthTag(authTag)

  try {
    let decrypted = decipher.update(ciphertextBase64, CRYPTO_ENCODING, "utf8")
    decrypted += decipher.final("utf8")
    return decrypted
  } catch (cause) {
    throw new CryptoError("crypto.decrypt_failed", "Decryption failed", {
      cause,
    })
  }
}
