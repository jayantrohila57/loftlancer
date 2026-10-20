import {
  type NotificationIconName,
  type NotificationRenderContext,
  type NotificationType,
  notificationDataSchemas,
  notificationRenderers,
} from "./registry";

export type NotificationListPresentation = {
  title: string;
  body: string;
  icon: NotificationIconName;
  href: string | null;
};

const defaultPresentation = (fallback: {
  title?: string | null;
  body?: string | null;
}): NotificationListPresentation => ({
  title: fallback.title?.trim() || "Notification",
  body: fallback.body?.trim() || "This notification is not linked to a page.",
  icon: "organization",
  href: null,
});

/**
 * Renders notification UI fields for list/bell views. Never throws: malformed or
 * unknown types fall back to stored title/body so list queries stay consistent
 * with unread counts.
 */
export function resolveNotificationPresentation(
  type: string,
  data: unknown,
  fallback: { title?: string | null; body?: string | null },
  context: NotificationRenderContext = {},
): NotificationListPresentation {
  if (!(type in notificationRenderers)) {
    return defaultPresentation(fallback);
  }

  const notificationType = type as NotificationType;
  const parsed = notificationDataSchemas[notificationType].safeParse(data);
  if (!parsed.success) {
    return defaultPresentation(fallback);
  }

  try {
    return notificationRenderers[notificationType](parsed.data, context);
  } catch {
    return defaultPresentation(fallback);
  }
}
