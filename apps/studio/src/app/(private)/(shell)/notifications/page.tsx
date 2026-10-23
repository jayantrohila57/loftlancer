import { env } from "@loftlancer/env/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { NotificationsPageClient } from "@/domain/notifications/components/notifications-page-client";
import { guardPageAction } from "@/lib/page-guards";
import { routes } from "@/utils/navigation";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Your notifications across organizations and projects.",
};

export default async function NotificationsPage() {
  await guardPageAction("notification.list");
  if (env.NOTIFICATIONS_ENABLED !== "true") {
    redirect(routes.home());
  }

  return <NotificationsPageClient />;
}
