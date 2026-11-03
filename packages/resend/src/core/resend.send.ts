import { logger } from "@loftlancer/sentry";

import { render } from "@react-email/components";

import { isEmailConfigured, resolveEmailFrom } from "../config/resend.env";
import type {
  EmailRecorder,
  RecordedEmail,
  SendEmailInput,
  SendEmailResult,
} from "../types/resend.types";
import { getResendClient } from "./resend.client";

let recorder: EmailRecorder | null = null;

/**
 * sendEmail is the only sender in the monorepo. Register one recorder (mailbox
 * persistence) and every send, including skipped and failed ones, passes
 * through it. Recorder errors never break a send.
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

export async function sendEmail(
  input: SendEmailInput,
): Promise<SendEmailResult> {
  const from = resolveEmailFrom();
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
      const { data, error } = await getResendClient().emails.send(
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
    context: input.context,
    result,
    createdAt: new Date(),
  });
  return result;
}
