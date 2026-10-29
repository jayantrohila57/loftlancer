import { NotificationPreferencesSkeleton } from "@/module/settings/settings.notifications.skeleton";
import { SettingsSectionShell } from "@/module/settings/settings.section";

export default function Loading() {
  return (
    <SettingsSectionShell
      title="Notifications"
      description="Choose which updates arrive in-app and by email."
    >
      <NotificationPreferencesSkeleton />
    </SettingsSectionShell>
  );
}
