import { logger } from "@loftlancer/logger";

import { render } from "@react-email/components";
import type { ReactElement } from "react";
import { Resend } from "resend";

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  react: ReactElement;
  idempotencyKey?: string;
  tags?: { name: string; value: string }[];
};

export type SendEmailResult =
  | { status: "sent"; id: string }
  | { status: "skipped"; reason: "not-configured" }
  | { status: "failed"; error: string };

// Resend has verified mail.loftlancer.com; keep the fallback on that domain.
const DEFAULT_FROM = "Loftlancer <noreply@mail.loftlancer.com>";

let client: Resend | null = null;

/** Full message as sent; the Mail app (#344) stores this in mail_message + mail_recipient. */
export type RecordedEmail = {
  from: string;
  to: string[];
  subject: string;
  html: string;
  text: string;
  tags?: { name: string; value: string }[];
  idempotencyKey?: string;
  result: SendEmailResult;
  createdAt: Date;
};

export type EmailRecorder = (email: RecordedEmail) => Promise<void> | void;

let recorder: EmailRecorder | null = null;

/**
 * sendEmail is the only sender in the monorepo. Register one recorder (the
 * future Mail app persistence) and every send, including skipped and failed
 * ones, passes through it. Recorder errors never break a send.
 */
export function setEmailRecorder(next: EmailRecorder | null): void {
  recorder = next;
}

async function record(email: RecordedEmail): Promise<void> {
  if (!recorder) return;
  try {
    await recorder(email);
  } catch (err) {
    logger.exception("email recorder failed", err);
  }
}

/** Email is off until RESEND_API_KEY exists; callers never need to check. */
export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

function getClient(): Resend {
  client ??= new Resend(process.env.RESEND_API_KEY);
  return client;
}

export async function sendEmail(
  input: SendEmailInput,
): Promise<SendEmailResult> {
  const from = process.env.EMAIL_FROM?.trim() || DEFAULT_FROM;
  const to = Array.isArray(input.to) ? input.to : [input.to];
  let html = "";
  let text = "";
  let result: SendEmailResult;
  try {
    html = await render(input.react);
    text = await render(input.react, { plainText: true });
    if (!isEmailConfigured()) {
      result = { status: "skipped", reason: "not-configured" };
    } else {
      const { data, error } = await getClient().emails.send(
        { from, to, subject: input.subject, html, text, tags: input.tags },
        input.idempotencyKey
          ? { idempotencyKey: input.idempotencyKey }
          : undefined,
      );
      result =
        error || !data
          ? { status: "failed", error: error?.message ?? "unknown error" }
          : { status: "sent", id: data.id };
    }
  } catch (err) {
    result = {
      status: "failed",
      error: err instanceof Error ? err.message : String(err),
    };
  }
  if (result.status === "failed") {
    logger.error("email send failed", undefined, {
      "error.message": result.error,
    });
  }
  await record({
    from,
    to,
    subject: input.subject,
    html,
    text,
    tags: input.tags,
    idempotencyKey: input.idempotencyKey,
    result,
    createdAt: new Date(),
  });
  return result;
}
