import type { Metadata } from "next";
import { guardPageAction } from "@/lib/page-guards";
import { getNotificationPreferences } from "@/module/settings/settings.notifications.service";
import { NotificationsSettingsView } from "@/module/settings/settings.notifications.view";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Choose where you receive account and workspace updates.",
};

export default async function NotificationsSettingsViewPage() {
  const session = await guardPageAction("notification.list");
  const data = await getNotificationPreferences(session);
  return <NotificationsSettingsView preferences={data} />;
}
