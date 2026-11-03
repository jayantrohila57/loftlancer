/**
 * Node `node:crypto` AES-256-GCM primitives and env-bound helpers.
 * Domain rules (e.g. which product values to encrypt) live in module/.
 */

export { decrypt, encrypt } from "./config/node-crypto.env";
export {
  NODE_CRYPTO_ALGORITHM,
  NODE_CRYPTO_AUTH_TAG_LENGTH,
  NODE_CRYPTO_ENCODING,
  NODE_CRYPTO_IV_LENGTH,
  NODE_CRYPTO_KEY_BYTES,
} from "./constants/node-crypto.constants";
export { decryptWithKey, encryptWithKey } from "./core/node-crypto.core";
