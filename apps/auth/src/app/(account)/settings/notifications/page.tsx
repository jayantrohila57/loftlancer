import { DelayedPageLoading } from "@loftlancer/ui/patterns/delayed-page-loading";
import type { Metadata } from "next";
import { Suspense } from "react";
import { SettingsSectionShell } from "@/app/(account)/settings/_components/settings-section-shell";
import { NotificationPreferencesPanel } from "@/domain/settings/components/notification-preferences-panel";
import { NotificationPreferencesSkeleton } from "@/domain/settings/components/notification-preferences-skeleton";
import { guardPageAction } from "@/lib/page-guards";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Choose where you receive account and workspace updates.",
};

export default async function NotificationsSettingsPage() {
  await guardPageAction("notification.list");

  return (
    <SettingsSectionShell
      title="Notifications"
      description="Choose which updates arrive in-app and by email."
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
