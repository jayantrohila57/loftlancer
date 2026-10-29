import { env } from "@loftlancer/env/server";
import { HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { guardPageAction } from "@/lib/page-guards";
import { hydrateNotificationsList } from "@/module/notifications/notifications.list.service";
import { NotificationsListView } from "@/module/notifications/notifications.list.view";
import { routes } from "@/utils/navigation";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Your notifications across organizations and projects.",
};

export default async function NotificationsPage() {
  const session = await guardPageAction("notification.list");
  if (env.NOTIFICATIONS_ENABLED !== "true") {
    redirect(routes.home());
  }

  const state = await hydrateNotificationsList(session);
  return (
    <HydrationBoundary state={state}>
      <NotificationsListView />
    </HydrationBoundary>
  );
}
