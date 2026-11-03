import { notificationTypes } from "../constants/notifications.types.constants";

export { notificationTypes };

export type NotificationIconName =
  | "invite"
  | "member"
  | "variable"
  | "organization";

export type NotificationType = (typeof notificationTypes)[number];

export type NotificationRenderContext = {
  actorName?: string | null;
  /** Resolved from the notification's organization when older payloads omit it. */
  organizationSlug?: string | null;
};

export type NotificationRenderResult = {
  title: string;
  body: string;
  icon: NotificationIconName;
  href: string | null;
};
