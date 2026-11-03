import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod/v3";

function normalizeAllowlistEmail(raw: string): string {
  return raw
    .trim()
    .replace(/^["']+|["']+$/g, "")
    .trim()
    .toLowerCase();
}

const emailListSchema = z
  .string()
  .min(1)
  .transform((raw) =>
    raw
      .split(/[,\n]+/)
      .map(normalizeAllowlistEmail)
      .filter(Boolean),
  );

export const consoleEnv = createEnv({
  server: {
    /** Comma-separated emails allowed to use apps/console (Decision 11). */
    CONSOLE_ALLOWED_EMAILS: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_CONSOLE_URL: z.string().url().optional(),
    NEXT_PUBLIC_AUTH_URL: z.string().url().optional(),
    NEXT_PUBLIC_STUDIO_URL: z.string().url().optional(),
  },
  runtimeEnv: {
    CONSOLE_ALLOWED_EMAILS: process.env.CONSOLE_ALLOWED_EMAILS,
    NEXT_PUBLIC_CONSOLE_URL: process.env.NEXT_PUBLIC_CONSOLE_URL,
    NEXT_PUBLIC_AUTH_URL: process.env.NEXT_PUBLIC_AUTH_URL,
    NEXT_PUBLIC_STUDIO_URL: process.env.NEXT_PUBLIC_STUDIO_URL,
  },
  emptyStringAsUndefined: true,
  skipValidation: process.env.SKIP_ENV_VALIDATION === "1",
});

export function parseConsoleAllowedEmails(
  raw: string | undefined = process.env.CONSOLE_ALLOWED_EMAILS ??
    consoleEnv.CONSOLE_ALLOWED_EMAILS,
): string[] {
  if (!raw?.trim()) {
    return [];
  }
  return emailListSchema.parse(raw);
}

/**
 * Production requires an explicit allowlist. Non-production allows any admin when unset.
 */
export function isEmailAllowedForConsole(
  email: string,
  options: { nodeEnv?: string; allowedEmails?: string[] } = {},
): boolean {
  const nodeEnv = options.nodeEnv ?? process.env.NODE_ENV ?? "development";
  const allowed = options.allowedEmails ?? parseConsoleAllowedEmails();
  if (allowed.length === 0 && nodeEnv !== "production") {
    return true;
  }
  if (!email?.trim()) {
    return false;
  }
  const normalized = normalizeAllowlistEmail(email);
  if (!normalized) {
    return false;
  }
  const normalizedAllowlist = allowed
    .map(normalizeAllowlistEmail)
    .filter(Boolean);
  return normalizedAllowlist.includes(normalized);
}
