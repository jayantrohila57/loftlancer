import { RESEND_DEFAULT_FROM } from "../constants/resend.constants";

/** Email is off until RESEND_API_KEY exists; callers never need to check. */
export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

/** Resolved From header: EMAIL_FROM or Resend-verified default. */
export function resolveEmailFrom(): string {
  return process.env.EMAIL_FROM?.trim() || RESEND_DEFAULT_FROM;
}

/** Trimmed Resend API key, or empty when unset. */
export function resolveResendApiKey(): string {
  return process.env.RESEND_API_KEY?.trim() ?? "";
}
