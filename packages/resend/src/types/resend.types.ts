import type { ReactElement } from "react";

export type EmailContext = {
  category?: "system" | "work" | "personal";
  senderUserId?: string;
  organizationId?: string;
  teamId?: string;
  projectId?: string;
  entity?: { type: string; id: string };
  templateKey?: string;
  templateProps?: Record<string, unknown>;
};

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  react: ReactElement;
  idempotencyKey?: string;
  tags?: { name: string; value: string }[];
  context?: EmailContext;
};

export type SendEmailResult =
  | { status: "sent"; id: string }
  | { status: "skipped"; reason: "not-configured" }
  | { status: "failed"; error: string };

/** Full message as sent; the Mail app (#344) stores this in mail_message + mail_recipient. */
export type RecordedEmail = {
  from: string;
  to: string[];
  subject: string;
  html: string;
  text: string;
  tags?: { name: string; value: string }[];
  idempotencyKey?: string;
  context?: EmailContext;
  result: SendEmailResult;
  createdAt: Date;
};

export type EmailRecorder = (email: RecordedEmail) => Promise<void> | void;
