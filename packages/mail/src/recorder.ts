import { db } from "@loftlancer/db";
import { user } from "@loftlancer/db/schema/auth";
import { mailMessage, mailRecipient } from "@loftlancer/db/schema/mail";
import {
  type EmailRecorder,
  type RecordedEmail,
  setEmailRecorder,
} from "@loftlancer/email";
import { eq, inArray, sql } from "drizzle-orm";

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

/** Persist a send after Resend returns. It is idempotent on the sender key. */
export const recordEmail: EmailRecorder = async (email) => {
  const idempotencyKey = email.idempotencyKey?.trim() || null;
  if (idempotencyKey) {
    const [existing] = await db
      .select({ id: mailMessage.id })
      .from(mailMessage)
      .where(eq(mailMessage.idempotencyKey, idempotencyKey))
      .limit(1);
    if (existing) return;
  }

  const context = email.context;
  const recipients = [
    ...new Set(email.to.map(normalizeMailboxEmail).filter(Boolean)),
  ];
  const matchedUsers =
    recipients.length === 0
      ? []
      : await db
          .select({ id: user.id, email: user.email })
          .from(user)
          .where(inArray(sql`lower(${user.email})`, recipients));
  const usersByEmail = new Map(
    matchedUsers.map((account) => [
      normalizeMailboxEmail(account.email),
      account.id,
    ]),
  );
  const [sender] = context?.senderUserId
    ? await db
        .select({ id: user.id, email: user.email })
        .from(user)
        .where(eq(user.id, context.senderUserId))
        .limit(1)
    : [];
  const result = mailboxDelivery(email.result);
  const messageId = crypto.randomUUID();

  await db.transaction(async (tx) => {
    await tx.insert(mailMessage).values({
      id: messageId,
      providerMessageId: result.providerMessageId,
      fromEmail: email.from,
      subject: email.subject,
      html: email.html,
      text: email.text,
      tags: email.tags ?? [],
      category: context?.category ?? "system",
      deliveryStatus: result.status,
      deliveryError: result.error,
      idempotencyKey,
      senderUserId: context?.senderUserId ?? null,
      organizationId: context?.organizationId ?? null,
      teamId: context?.teamId ?? null,
      projectId: context?.projectId ?? null,
      entityType: context?.entity?.type ?? null,
      entityId: context?.entity?.id ?? null,
      templateKey: context?.templateKey ?? null,
      templateProps: context?.templateProps ?? null,
      createdAt: email.createdAt,
    });
    const recipientRows: {
      id: string;
      messageId: string;
      recipientUserId: string | null;
      email: string;
      folder: "inbox" | "sent";
    }[] = recipients.map((recipient) => ({
      id: crypto.randomUUID(),
      messageId,
      recipientUserId: usersByEmail.get(recipient) ?? null,
      email: recipient,
      folder: "inbox",
    }));
    if (sender) {
      recipientRows.push({
        id: crypto.randomUUID(),
        messageId,
        recipientUserId: sender.id,
        email: normalizeMailboxEmail(sender.email),
        folder: "sent",
      });
    }
    if (recipientRows.length > 0) {
      await tx.insert(mailRecipient).values(recipientRows);
    }
  });
};

/** Call once from each Node.js app's instrumentation register function. */
export function installMailboxRecorder(): void {
  setEmailRecorder(recordEmail);
}
