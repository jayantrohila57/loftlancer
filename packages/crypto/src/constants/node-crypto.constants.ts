/** AES-256-GCM via Node `node:crypto` (createCipheriv / createDecipheriv). */
export const NODE_CRYPTO_ALGORITHM = "aes-256-gcm" as const;
/** GCM recommended IV length in bytes. */
export const NODE_CRYPTO_IV_LENGTH = 12;
export const NODE_CRYPTO_AUTH_TAG_LENGTH = 16;
export const NODE_CRYPTO_ENCODING = "base64" as const;
/** AES-256 key length in bytes (ENCRYPTION_KEY is 64 hex chars). */
export const NODE_CRYPTO_KEY_BYTES = 32;
