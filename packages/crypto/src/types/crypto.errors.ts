export type CryptoErrorCode =
  | "crypto.decrypt_failed"
  | "crypto.invalid_format"
  | "crypto.invalid_key"
  | "crypto.invalid_parts"
  | "crypto.missing_encryption_key"

export class CryptoError extends Error {
  constructor(
    readonly code: CryptoErrorCode,
    message: string,
    options?: { cause?: unknown }
  ) {
    super(message, options)
    this.name = "CryptoError"
  }
}
