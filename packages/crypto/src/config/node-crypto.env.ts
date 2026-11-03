import { env } from "@loftlancer/t3-env/server";

import { decryptWithKey, encryptWithKey } from "../core/node-crypto.core";

/**
 * Encrypts a string using AES-256-GCM with `ENCRYPTION_KEY`.
 * @returns Encrypted string in format: iv:authTag:ciphertext
 */
export function encrypt(text: string): string {
  return encryptWithKey(text, env.ENCRYPTION_KEY);
}

/**
 * Decrypts a string encrypted with `encrypt`. Empty values (`iv:tag:`) are
 * supported and return "".
 */
export function decrypt(encryptedText: string): string {
  return decryptWithKey(encryptedText, env.ENCRYPTION_KEY);
}
