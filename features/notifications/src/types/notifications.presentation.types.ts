import type { NotificationIconName } from "./notifications.registry.types";

export type NotificationListPresentation = {
  title: string;
  body: string;
  icon: NotificationIconName;
  href: string | null;
};
