import { DelayedPageLoading } from "@loftlancer/ui/patterns/delayed-page-loading";
import type { Metadata } from "next";
import { Suspense } from "react";
import { SettingsSectionShell } from "@/app/(account)/settings/_components/settings-section-shell";
import { NotificationPreferencesPanel } from "@/domain/settings/components/notification-preferences-panel";
import { NotificationPreferencesSkeleton } from "@/domain/settings/components/notification-preferences-skeleton";
import { guardPageAction } from "@/lib/page-guards";

export const metadata: Metadata = {
  title: "Notifications",
  description: "In-app notification preferences.",
};

export default async function NotificationsSettingsPage() {
  await guardPageAction("notification.list");

  return (
    <SettingsSectionShell
      title="Notifications"
      description="Where to review in-app alerts."
    >
      <Suspense
        fallback={
          <DelayedPageLoading fallback={<NotificationPreferencesSkeleton />} />
        }
      >
        <NotificationPreferencesPanel />
      </Suspense>
    </SettingsSectionShell>
  );
}
