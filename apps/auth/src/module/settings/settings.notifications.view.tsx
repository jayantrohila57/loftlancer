import { NotificationPreferencesPanel } from "./settings.notifications.panel";
import { SettingsSectionShell } from "./settings.section";
import type { SettingsNotificationPreferences } from "./settings.types";

export function NotificationsSettingsView({
  preferences,
}: {
  preferences: SettingsNotificationPreferences;
}) {
  return (
    <SettingsSectionShell
      title="Notifications"
      description="Choose which updates arrive in-app and by email."
    >
      <NotificationPreferencesPanel initialPreferences={preferences} />
    </SettingsSectionShell>
  );
}
