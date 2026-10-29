import type { getConnectedAccounts } from "./settings.accounts.service";
import type { getNotificationPreferences } from "./settings.notifications.service";
import type { getActiveSessions } from "./settings.sessions.service";

export type SettingsConnectedAccounts = Awaited<
  ReturnType<typeof getConnectedAccounts>
>;
export type SettingsNotificationPreferences = Awaited<
  ReturnType<typeof getNotificationPreferences>
>;
export type SettingsSessions = Awaited<ReturnType<typeof getActiveSessions>>;
export type SettingsProfile = {
  name: string;
  email: string;
  image: string | null;
};
