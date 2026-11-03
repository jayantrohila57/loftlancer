import { z } from "zod/v3";

/** 32-byte AES-256 key as 64 hex characters (see @loftlancer/crypto). */
export const encryptionKeySchema = z
  .string()
  .regex(
    /^[0-9a-fA-F]{64}$/,
    "ENCRYPTION_KEY must be 64 hex characters (32 bytes)",
  );
