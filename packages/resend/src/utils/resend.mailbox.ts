import type { RecordedEmail } from "../types/resend.types";

export function normalizeMailboxEmail(value: string) {
  return value.trim().toLowerCase();
}

export function mailboxDelivery(result: RecordedEmail["result"]) {
  if (result.status === "sent") {
    return {
      status: "sent" as const,
      providerMessageId: result.id,
      error: null,
    };
  }
  if (result.status === "failed") {
    return {
      status: "failed" as const,
      providerMessageId: null,
      error: result.error,
    };
  }
  return { status: "skipped" as const, providerMessageId: null, error: null };
}
