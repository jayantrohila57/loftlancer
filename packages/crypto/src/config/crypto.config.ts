import { serverEnv } from "@packages/t3-env/server"

import { decryptWithKey, encryptWithKey } from "../core/crypto.core"
import { CryptoError } from "../types/crypto.errors"

function requireEncryptionKey(): string {
  const key = serverEnv.ENCRYPTION_KEY
  if (!key) {
    throw new CryptoError(
      "crypto.missing_encryption_key",
      "ENCRYPTION_KEY is not set"
    )
  }
  return key
}

/**
 * Encrypts a string using AES-256-GCM with `ENCRYPTION_KEY`.
 * @returns Encrypted string in format `iv:authTag:ciphertext`
 */
export function encrypt(text: string): string {
  return encryptWithKey(text, requireEncryptionKey())
}

/** Decrypts a value produced by `encrypt`. */
export function decrypt(encryptedText: string): string {
  return decryptWithKey(encryptedText, requireEncryptionKey())
}
