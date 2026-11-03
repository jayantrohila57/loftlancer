import { Resend } from "resend";

import { resolveResendApiKey } from "../config/resend.env";

let client: Resend | null = null;

/** Lazy Resend SDK client (singleton per process). */
export function getResendClient(): Resend {
  client ??= new Resend(resolveResendApiKey());
  return client;
}

/** Test helper: drop the cached client so the next send rebuilds it. */
export function resetResendClient(): void {
  client = null;
}
