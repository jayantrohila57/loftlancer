export type NotificationPreferences = {
  invitations: { inApp: boolean; email: boolean };
  membership: { inApp: boolean; email: boolean };
  projectActivity: { inApp: boolean; email: boolean };
  support: { inApp: boolean; email: boolean };
};

export type NotificationPreferenceGroup = keyof NotificationPreferences;
