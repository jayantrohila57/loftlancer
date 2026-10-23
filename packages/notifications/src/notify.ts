import { activeNotificationWhere, db } from "@loftlancer/db";
import { user } from "@loftlancer/db/schema/auth";
import { notification } from "@loftlancer/db/schema/notifications";
import { NotificationEmail, sendEmail } from "@loftlancer/email";
import { DEFAULT_STUDIO_URL } from "@loftlancer/env/platform";
import { and, eq, isNull, sql } from "drizzle-orm";
import { createElement } from "react";
import { isNotificationsEnabled } from "./feature";
import {
  defaultNotificationPreferences,
  notificationPreferenceGroup,
  notificationPreferencesSchema,
} from "./preferences";
import {
  type NotificationType,
  notificationDataSchemas,
  notificationRenderers,
} from "./registry";

export type NotifyRecipient = {
  userId?: string;
  email?: string;
};

export type NotifyInput = {
  type: NotificationType;
  recipients: NotifyRecipient[];
  actorUserId?: string | null;
  organizationId?: string | null;
  entity?: { type: string; id: string };
  data: unknown;
  idempotencyKey?: string;
  actorName?: string | null;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function notify(input: NotifyInput): Promise<number> {
  if (!isNotificationsEnabled()) {
    return 0;
  }

  const schema = notificationDataSchemas[input.type];
  const parsedData = schema.parse(input.data);
  const rendered = notificationRenderers[input.type](parsedData, {
    actorName: input.actorName,
  });

  const group = notificationPreferenceGroup(input.type);
  let created = 0;
  for (const recipient of input.recipients) {
    const userId = recipient.userId?.trim() || null;
    const email = recipient.email ? normalizeEmail(recipient.email) : null;
    if (!userId && !email) continue;

    let account: {
      email: string;
      emailVerified: boolean;
      notificationPreferences: unknown;
    } | null = null;
    if (userId) {
      const [row] = await db
        .select({
          email: user.email,
          emailVerified: user.emailVerified,
          notificationPreferences: user.notificationPreferences,
        })
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);
      account = row ?? null;
    }

    const parsedPreferences = account
      ? notificationPreferencesSchema.safeParse(account.notificationPreferences)
      : null;
    const preferences =
      parsedPreferences?.success === true
        ? parsedPreferences.data
        : defaultNotificationPreferences;
    const settings = preferences[group];

    // Invitation messages are already sent by the invitation workflow itself.
    // The group's email toggle gates that transactional message there, avoiding
    // a second, duplicate email from the in-app notification trigger.
    if (
      account?.emailVerified &&
      settings.email &&
      input.type !== "invitation.received"
    ) {
      const studioUrl = (
        process.env.NEXT_PUBLIC_STUDIO_URL ?? DEFAULT_STUDIO_URL
      ).replace(/\/$/, "");
      const href = rendered.href
        ? `${studioUrl}${rendered.href.startsWith("/") ? rendered.href : `/${rendered.href}`}`
        : null;
      await sendEmail({
        to: account.email,
        subject: rendered.title,
        react: createElement(NotificationEmail, {
          title: rendered.title,
          body: rendered.body,
          href,
        }),
        idempotencyKey: input.idempotencyKey
          ? `${input.idempotencyKey}:email:${userId}`
          : undefined,
        tags: [{ name: "type", value: "notification" }],
      });
    }

    if (userId && !settings.inApp) continue;
    const row = {
      id: crypto.randomUUID(),
      recipientUserId: userId,
      recipientEmail: userId ? null : email,
      organizationId: input.organizationId ?? null,
      type: input.type,
      actorUserId: input.actorUserId ?? null,
      entityType: input.entity?.type ?? null,
      entityId: input.entity?.id ?? null,
      data: parsedData,
      title: rendered.title,
      body: rendered.body,
      idempotencyKey: input.idempotencyKey ?? null,
    };

    if (row.idempotencyKey) {
      const existing = await db
        .select({ id: notification.id })
        .from(notification)
        .where(
          activeNotificationWhere(
            row.recipientUserId
              ? and(
                  eq(notification.recipientUserId, row.recipientUserId),
                  eq(notification.idempotencyKey, row.idempotencyKey),
                )
              : and(
                  eq(notification.recipientEmail, row.recipientEmail ?? ""),
                  eq(notification.idempotencyKey, row.idempotencyKey),
                ),
          ),
        )
        .limit(1);
      if (existing.length > 0) {
        continue;
      }
    }

    await db.insert(notification).values(row);
    created++;
  }

  return created;
}

export async function linkPendingNotificationsForUser(
  userId: string,
  email: string,
) {
  if (!isNotificationsEnabled()) {
    return;
  }

  const normalized = normalizeEmail(email);
  const [account] = await db
    .select({ notificationPreferences: user.notificationPreferences })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  const preferences = notificationPreferencesSchema.safeParse(
    account?.notificationPreferences,
  );
  if (preferences.success && !preferences.data.invitations.inApp) {
    await db
      .update(notification)
      .set({ deletedAt: new Date(), deletedBy: userId })
      .where(
        and(
          isNull(notification.recipientUserId),
          eq(sql`lower(${notification.recipientEmail})`, normalized),
          eq(notification.type, "invitation.received"),
        ),
      );
  }
  await db
    .update(notification)
    .set({
      recipientUserId: userId,
      recipientEmail: null,
    })
    .where(
      and(
        isNull(notification.recipientUserId),
        eq(sql`lower(${notification.recipientEmail})`, normalized),
      ),
    );
}
