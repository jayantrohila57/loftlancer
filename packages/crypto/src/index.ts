/**
 * AES-256-GCM primitives (`encryptWithKey` / `decryptWithKey`).
 * Env-bound helpers live in `@packages/crypto/server`.
 */

export {
  CRYPTO_ALGORITHM,
  CRYPTO_AUTH_TAG_LENGTH,
  CRYPTO_ENCODING,
  CRYPTO_IV_LENGTH,
  CRYPTO_KEY_BYTES,
} from "./constants/crypto.constants"
export { decryptWithKey, encryptWithKey } from "./core/crypto.core"
export { CryptoError, type CryptoErrorCode } from "./types/crypto.errors"
